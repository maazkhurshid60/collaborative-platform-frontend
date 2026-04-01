import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Check, ShieldCheck, Lock, Info } from "lucide-react";

import { subscriptionApiService } from "../../services/subscriptionApiService";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import authService from "../../apiServices/authApi/AuthApi";
import messageApiService from "../../apiServices/chatApi/messagesApi/MessagesApi";
import { useDispatch, useSelector } from "react-redux";
import { saveDecryptedPrivateKey, saveLoginUserDetailsReducer } from "../../redux/slices/LoginUserDetailSlice";
import { addDataNewJoinUserReducer, emptyDataNewJoinUserReducer } from "../../redux/slices/JoinNowUserSlice";
import CryptoJS from "crypto-js";
import naclUtil from "tweetnacl-util";
import { toast } from "react-toastify";
import { RootState } from "../../redux/store";

// Initialize Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

const CheckoutForm = ({ clientSecret, subscriptionId, customerId, userData, price, planType, billingCycle, inviteToken }: any) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isElementReady, setIsElementReady] = useState(false);

    // Get logged in user for refresh logic
    const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
    const loggedInUser = userDetails?.user;

    // Get join user data for group-invite handling
    const joinUser = useSelector((state: RootState) => state.joinUserSlice?.data);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const isSetupIntent = clientSecret.startsWith("seti_");

            let result;
            if (isSetupIntent) {
                result = await stripe.confirmSetup({
                    elements,
                    redirect: "if_required",
                });
            } else {
                result = await stripe.confirmPayment({
                    elements,
                    redirect: "if_required",
                });
            }

            // Handle the error property which exists on both types
            if (result.error) {
                setErrorMessage(result.error.message || "Payment failed");
                toast.error(result.error.message || "Payment failed");
                navigate("/payment-failure", { state: { error: result.error.message || "Payment failed", userData, planType, billingCycle } });
                setIsLoading(false);
                return;
            }

            // Type-safe handling of different result types
            if (isSetupIntent) {
                // result is SetupIntentResult
                const setupIntent = (result as any).setupIntent;
                if (setupIntent && (setupIntent.status === "succeeded" || setupIntent.status === "processing")) {
                    await handleSuccessAndRedirect();
                } else {
                    await handleSuccessAndRedirect();
                }
            } else {
                // result is PaymentIntentResult
                const paymentIntent = (result as any).paymentIntent;
                if (paymentIntent && paymentIntent.status === "succeeded") {
                    await handleSuccessAndRedirect();
                } else {
                    await handleSuccessAndRedirect();
                }
            }

        } catch (err: any) {
            setErrorMessage(err.message || "An unexpected error occurred");
            toast.error(err.message || "An unexpected error occurred");
            navigate("/payment-failure", { state: { error: err.message || "Payment failed", userData, planType, billingCycle } });
            setIsLoading(false);
        }
    };

    const handleSuccessAndRedirect = async () => {
        try {
            const token = localStorage.getItem("token");

            if (token && loggedInUser) {
                // USER IS ALREADY LOGGED IN (Upgrade Flow)
                // Refresh user details before redirecting
                try {
                    const role = loggedInUser.role || 'PROVIDER';

                    // 1. Force Sync first
                    await subscriptionApiService.syncSubscription().catch((_syncErr: any) => {
                    });

                    // 2. Refresh data
                    const response = await authService.getMe(loggedInUser.id, role);

                    // response.data is the ApiResponse, so response.data.data is the payload { data: getMeDetails }
                    const getMeDetails = response?.data?.data;

                    if (getMeDetails && getMeDetails.user) {
                        const fixedUserData = {
                            ...getMeDetails,
                            clientList: getMeDetails.clientList?.map((item: any) => item.client) || []
                        };
                        dispatch(saveLoginUserDetailsReducer(fixedUserData));
                    }
                } catch (_refreshError: any) {
                }

                toast.success("Subscription upgraded successfully!");
                navigate("/payment-success");
                return;
            }

            // NEW USER (Signup Flow)
            const response = await authService.signup({
                ...userData,
                subscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                // If this user was invited (inviteToken), pass it so backend can process the invite
                ...(inviteToken ? { inviteToken } : {}),
            });
            toast.success("Account created and subscription active!");

            const signupToken = response?.data?.token;
            const user = response?.data?.user;

            if (signupToken && user) {
                localStorage.setItem("token", signupToken);

                const encryptedPrivateKey = user?.user?.privateKey;
                if (encryptedPrivateKey) {
                    try {
                        const decryptedKeyString = CryptoJS.AES.decrypt(encryptedPrivateKey, userData.password).toString(CryptoJS.enc.Utf8);
                        const decryptedPrivateKeyUint8 = naclUtil.decodeBase64(decryptedKeyString);
                        const base64Key = naclUtil.encodeBase64(decryptedPrivateKeyUint8);
                        dispatch(saveDecryptedPrivateKey(base64Key));
                    } catch (_decryptError) {
                    }
                }

                const fixedUserData = {
                    ...user,
                    clientList: user?.clientList?.map((item: any) => item.client) || []
                };
                dispatch(saveLoginUserDetailsReducer(fixedUserData));
            }

            // ✅ Group-join: if this user was invited to a group/chat, complete the join now
            if (joinUser?.groupId && joinUser?.memberEmail) {
                try {
                    await messageApiService.updateGroupApi({
                        groupId: joinUser.groupId,
                        memberEmail: joinUser.memberEmail,
                    });
                    toast.success('You have joined the group. Please login to continue.');
                } catch (_groupErr) {
                    // Still dispatch isNewJoin so the retry logic kicks in on next login
                    dispatch(addDataNewJoinUserReducer({ ...joinUser, isNewJoin: true }));
                }
            }

            dispatch(emptyDataNewJoinUserReducer());

            // Redirect to Payment Success Page
            setTimeout(() => navigate("/payment-success"), 1500);

        } catch (err: any) {
            if (err.response?.status === 429) {
                toast.error("Too Many Request Please Try again later");
                setIsLoading(false);
                return;
            }
            if (err.response?.status === 409) {
                toast.warning("Payment was successful, but your account already exists. Please try logging in.");
                navigate("/");
                return;
            }
            toast.error("Payment successful but account processing failed. Please contact support.");
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">

            <div className="mb-6 min-h-[200px] relative w-full">
                {/* Loading Spinner */}
                {!isElementReady && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center bg-white z-10 w-full min-h-[200px] border border-dashed border-gray-300 rounded mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C9993]"></div>
                        <span className="ml-2 text-gray-500 mt-2">Loading Payment Form...</span>
                    </div>
                )}

                {/* 
      We leave PaymentElement in the normal document flow so Safari renders it.
      We just cover it with the absolute-positioned loading spinner above!
    */}
                <div className={`w-full transition-opacity duration-300 ${isElementReady ? "opacity-100" : "opacity-0"}`}>
                    <PaymentElement
                        onReady={() => {
                            setIsElementReady(true);
                        }}
                    />
                </div>
            </div>

            {errorMessage && <div className="text-red-500 mb-4 text-sm">{errorMessage}</div>}

            <button
                disabled={!stripe || isLoading}
                type="submit"
                className="w-full bg-[#2C9993] text-white font-semibold text-[20px] py-4 rounded-xl hover:bg-[#237c76] transition-all shadow-lg shadow-[#2c9993]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Processing..." : `Pay $${price || '??'} & Subscribe`}
            </button>
            <div className="flex items-center gap-2 text-[#667085] text-[14px] justify-center mt-4">
                <ShieldCheck size={18} className="text-[#2C9993]" />
                <span>Your payment is processed securely</span>
            </div>
            <p className="text-[12px] text-[#98A2B3] text-center max-w-[450px] mx-auto mt-4">
                By completing this purchase, you agree to our <span className="text-[#2C9993] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#2C9993] hover:underline cursor-pointer">Privacy Policy</span>
            </p>
        </form>
    );
};

export const PaymentCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { planType = 'STANDARD', billingCycle = 'MONTHLY', userData, inviteToken } = location.state || {};
    const token = localStorage.getItem("token");

    const [clientSecret, setClientSecret] = useState("");
    const [subscriptionId, setSubscriptionId] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [isInitializing, setIsInitializing] = useState(false);

    const userDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails);
    const loggedInUser = userDetails?.user;

    const getPrice = () => {
        if (planType === 'PRO') return billingCycle === 'MONTHLY' ? 79 : 756;
        return billingCycle === 'MONTHLY' ? 9.99 : 95.90;
    };
    const price = getPrice();
    const tax = 0;
    const total = price;

    const handleInitializePayment = async () => {

        if (!token && (!userData || !userData.email)) {
            toast.error("Please sign up first.");
            navigate("/provider-signup");
            return;
        }

        setIsInitializing(true);
        try {
            const data = {
                // @ts-ignore
                email: token ? userDetails?.user?.email : userData?.email,
                name: token ? userDetails?.user?.fullName : userData?.fullName,
                planType,
                period: billingCycle,
                licenseNo: userData?.licenseNo
            };

            if (!data.email || !data.planType || !data.period) {
                console.error('❌ Missing required fields:', {
                    email: data.email,
                    planType: data.planType,
                    period: data.period,
                    name: data.name
                });
                toast.error(`Missing required fields: ${!data.email ? 'email ' : ''}${!data.planType ? 'plan ' : ''}${!data.period ? 'period' : ''}`);
                setIsInitializing(false);
                return;
            }

            if (!token) {
                try {
                    const conflictRes = await authService.checkEmail(data.email, data.licenseNo);
                    if (conflictRes?.data?.exists) {
                        const field = conflictRes.data.field || "Account details";
                        toast.error(`${field} is already registered. Please login or use different details.`);
                        setIsInitializing(false);
                        return;
                    }
                } catch (conflictErr: any) {
                    if (conflictErr?.response?.status === 409) {
                        const field = conflictErr.response.data?.data?.field || "Account details";
                        toast.error(`${field} is already registered. Please login or use different details.`);
                        setIsInitializing(false);
                        return;
                    }
                }
            }

            const res = await subscriptionApiService.createSubscriptionIntent(data);
            setClientSecret(res.clientSecret);
            setSubscriptionId(res.subscriptionId);
            setCustomerId(res.customerId);
            toast.success("Payment initialized!");

        } catch (error: any) {
            console.error("Failed to init payment:", error);
            if (error?.response?.status === 429) {
                toast.error("Too Many Request Please Try again later");
            } else {
                const msg = error.response?.data?.message || "Failed to initialize payment.";
                const debug = error.response?.data?.debug;
                toast.error(msg);
                if (debug) console.error("Debug info:", debug);
            }
        } finally {
            setIsInitializing(false);
        }
    };

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#2C9993',
            },
        },
    };

    const features = [
        "Up to 100 Clients",
        "Basic invoicing & billing",
        "Email support",
        "Payment processing",
        "Basic analytics",
        "Mobile app access"
    ];

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins]">

            <main className="max-w-full mx-auto px-6 py-10 lg:py-16">
                <div className="flex flex-col xl:flex-row gap-8">

                    <div className="w-full xl:w-[60%] flex flex-col gap-8">

                        <div className="bg-white rounded-[12px] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-[32px] font-semibold text-[#101828]">Plan Summary</h1>
                                <button
                                    onClick={() => navigate("/select-plan")}
                                    className="text-[#2C9993] font-medium hover:underline cursor-pointer"
                                >
                                    Change Plan
                                </button>
                            </div>

                            <div className="flex items-end justify-between mb-8">
                                <div className="flex flex-col">
                                    <h2 className="text-[20px] font-bold text-[#101828]">{planType} Plan</h2>
                                    <p className="text-[16px] text-[#667085]">{billingCycle === 'MONTHLY' ? 'Monthly' : 'Yearly'} billing</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[32px] font-bold text-[#101828]">${price}</span>
                                    <span className="text-[16px] text-[#667085]">/{billingCycle === 'MONTHLY' ? 'month' : 'year'}</span>
                                </div>
                            </div>
                            <p className="text-[14px] font-bold text-[#101828] mb-4">What's included:</p>
                            <div className="bg-inputBgColor rounded-[12px] p-6">

                                <ul className="grid grid-cols-1 md:grid-cols-1 gap-y-3">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-x-3">
                                            <Check size={20} className="text-[#2C9993]" strokeWidth={2.5} />
                                            <span className="text-[15px] text-[#475467]">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Price Breakdown Card */}
                        <div className="bg-white rounded-[12px] p-8 shadow-sm">
                            <h2 className="text-[24px] font-semibold text-[#101828] mb-6">Price Breakdown</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-[16px] text-[#667085]">Subtotal</span>
                                    <span className="text-[16px] font-medium text-[#101828]">${price.toFixed(2)}</span>
                                </div>
                                {/* <div className="flex items-center justify-between">
                                    <span className="text-[16px] text-[#667085]">Tax (0%)</span>
                                    <span className="text-[16px] font-medium text-[#101828]">$0.00</span>
                                </div> */}
                            </div>
                            <div className="border-t border-[#E2E8F0] pt-6 mb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[20px] font-bold text-[#101828]">Total</span>
                                    <span className="text-[24px] font-bold text-[#101828]">${total.toFixed(2)}</span>
                                </div>
                                <p className="text-[14px] text-[#667085] mt-1">
                                    Billed {billingCycle === 'MONTHLY' ? 'monthly' : 'yearly'}, cancel anytime
                                </p>
                            </div>
                        </div>



                        {/* Payment Actions (Initial Button) - Left Column */}

                        {/* Payment Actions - Left Column */}
                        <div className="mt-8">
                            {!clientSecret ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-full flex flex-col items-center gap-4">
                                        <button
                                            onClick={handleInitializePayment}
                                            disabled={isInitializing}
                                            className="w-[220px] bg-[#2C9993] text-white font-semibold text-[20px] py-4 rounded-xl hover:bg-[#237c76] transition-all shadow-lg shadow-[#2c9993]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isInitializing ? "Initializing..." : "Pay with Stripe"}
                                        </button>
                                        <div className="flex items-center gap-2 text-[#667085] text-[14px]">
                                            <ShieldCheck size={18} className="text-[#2C9993]" />
                                            <span>Your payment is processed securely</span>
                                        </div>
                                        <p className="text-[12px] text-[#98A2B3] text-center max-w-[450px]">
                                            By completing this purchase, you agree to our <span className="text-[#2C9993] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#2C9993] hover:underline cursor-pointer">Privacy Policy</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-4 transition-all duration-500 ease-in-out animate-fadeIn">
                                    <Elements key={clientSecret} stripe={stripePromise} options={options as any}>
                                        <CheckoutForm
                                            clientSecret={clientSecret}
                                            subscriptionId={subscriptionId}
                                            customerId={customerId}
                                            userData={userData}
                                            planType={planType}
                                            billingCycle={billingCycle}
                                            price={total}
                                            inviteToken={inviteToken}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Trust Badges */}
                    <div className="w-full xl:w-[40%] flex flex-col gap-6">
                        {/* Trust Badges */}
                        <div className="bg-[#2C9993]/20 rounded-[12px] p-8 border border-[#CCFBEF]">

                            <div className="flex items-center gap-2 text-[#0D9488] mb-8">
                                <ShieldCheck size={24} />
                                <h2 className="text-[24px] font-bold">Trust Badges</h2>
                            </div>

                            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                                <div className="flex flex-col items-center text-center flex-1">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#CCFBEF]">
                                        <ShieldCheck size={28} className="text-[#2C9993]" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#101828] mb-1">Secure Payment</h3>
                                    <p className="text-[14px] text-[#667085]">256-bit SSL encryption</p>
                                </div>

                                <div className="flex flex-col items-center text-center flex-1">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#CCFBEF]">
                                        <Lock size={28} className="text-[#2C9993]" />
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#101828] mb-1">Data Protected</h3>
                                    <p className="text-[14px] text-[#667085]">PCI DSS compliant</p>
                                </div>

                                <div className="flex flex-col items-center text-center flex-1">
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-[#CCFBEF]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                            <path d="M3.07172 1.88805C4.14923 0.999166 5.37114 0.421389 6.73747 0.15472C8.07047 -0.100834 9.39236 -0.0397224 10.7031 0.338055C12.0473 0.738054 13.2247 1.43805 14.2356 2.43805C15.0243 3.23805 15.6297 4.16028 16.0518 5.20472C16.4628 6.20472 16.6683 7.24916 16.6683 8.33805C16.6683 9.42694 16.4628 10.4714 16.0518 11.4714C15.6297 12.5158 15.0215 13.4353 14.2273 14.2297C13.433 15.0242 12.5138 15.6325 11.4696 16.0547C10.4699 16.4658 9.42568 16.6714 8.33707 16.6714C7.24845 16.6714 6.20427 16.4658 5.20452 16.0547C4.16034 15.6325 3.23834 15.0269 2.43854 14.2381C1.40547 13.1936 0.694535 11.9714 0.305744 10.5714C-0.0719397 9.21583 -0.0997105 7.84916 0.222431 6.47139L0.272419 6.22139L1.88868 6.63805C1.58876 7.77139 1.58876 8.89917 1.88868 10.0214C2.18861 11.1881 2.76624 12.1992 3.62158 13.0547C4.47692 13.9103 5.48778 14.4881 6.65416 14.7881C7.7761 15.0769 8.89804 15.0769 10.02 14.7881C11.1864 14.4881 12.1972 13.9103 13.0526 13.0547C13.9079 12.1992 14.4855 11.1881 14.7855 10.0214C15.0743 8.89917 15.0743 7.77694 14.7855 6.65472C14.4855 5.48805 13.9079 4.47694 13.0526 3.62139C12.2861 2.85472 11.3863 2.31028 10.3532 1.98805C9.35348 1.66583 8.33151 1.58805 7.28733 1.75472C6.24315 1.92139 5.29339 2.31583 4.43804 2.93805L4.25476 3.07139L5.10454 3.92139L1.27217 4.80472L2.15528 0.971388L3.07172 1.88805ZM9.17019 3.33805V5.00472H11.253V6.67139H6.67082C6.55973 6.67139 6.46254 6.71305 6.37922 6.79639C6.29591 6.87972 6.25426 6.97416 6.25426 7.07972C6.25426 7.18528 6.28758 7.27694 6.35423 7.35472C6.42088 7.4325 6.50419 7.4825 6.60417 7.50472H6.67082H10.0033C10.381 7.50472 10.7281 7.59916 11.0447 7.78805C11.3613 7.97694 11.614 8.22972 11.8029 8.54639C11.9917 8.86305 12.0861 9.21028 12.0861 9.58805C12.0861 9.96583 11.9917 10.3131 11.8029 10.6297C11.614 10.9464 11.3613 11.1992 11.0447 11.3881C10.7281 11.5769 10.381 11.6714 10.0033 11.6714H9.17019V13.3381H7.50394V11.6714H5.42113V10.0047H10.0033C10.1144 10.0047 10.2116 9.96305 10.2949 9.87972C10.3782 9.79639 10.4199 9.70194 10.4199 9.59639C10.4199 9.49083 10.3866 9.39917 10.3199 9.32139C10.2533 9.24361 10.1699 9.19361 10.07 9.17139H10.0033H6.67082C6.29314 9.17139 5.946 9.07694 5.62941 8.88805C5.31282 8.69916 5.06011 8.44639 4.87127 8.12972C4.68243 7.81305 4.58801 7.46583 4.58801 7.08805C4.58801 6.71028 4.68243 6.36305 4.87127 6.04639C5.06011 5.72972 5.31282 5.47694 5.62941 5.28805C5.946 5.09916 6.29314 5.00472 6.67082 5.00472H7.50394V3.33805H9.17019Z" fill="#2C9993" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[18px] font-bold text-[#101828] mb-1">Money Back</h3>
                                    <p className="text-[14px] text-[#667085]">30-day guarantee</p>
                                </div>
                            </div>

                            <div className="mt-8 ">
                                <div className="flex items-center gap-2 px-4 py-2 ">
                                    <Info size={16} className="text-[#2C9993]" />
                                    <p className="text-[12px] text-[#475467]">Your payment information is encrypted and secure. We never store your card details.</p>
                                </div>
                            </div>
                        </div>


                    </div>

                </div>
            </main>
        </div>
    );
};



// <div className="mb-6 min-h-[200px]">
//     {!isElementReady && (
//         <div className="flex justify-center items-center h-[200px] border border-dashed border-gray-300 rounded mb-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C9993]"></div>
//             <span className="ml-2 text-gray-500">Loading Payment Form...</span>
//         </div>
//     )}
//     {/* Keep PaymentElement mounted to ensure it loads, but hide it visually until ready */}
//     <div style={{
//         opacity: isElementReady ? 1 : 0,
//         position: isElementReady ? 'static' : 'absolute',
//         zIndex: -1,
//         visibility: isElementReady ? 'visible' : 'hidden',
//     }}>
//         <PaymentElement
//             onReady={() => {
//                 console.log("Payment Element Ready");
//                 setIsElementReady(true);
//             }}
//         />
//     </div>
// </div>
