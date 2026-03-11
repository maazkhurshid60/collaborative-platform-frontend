import { Calendar, Check, Clock, DeleteIcon, Download, Eye, File, FilePenLine, FileText, Info, Trash, User, View, ViewIcon } from "lucide-react";
import BackIcon from "../../../components/icons/back/Back";
import { useNavigate, useParams } from "react-router-dom"
import { GoDotFill } from "react-icons/go";

import Table from "../../../components/table/Table";
import InvoiceModal from "../../../components/modals/InvoiceModal";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import { useState, useEffect, useMemo } from "react";
import DeleteProviderBilling from "../../../components/modals/superAdminModal/deleteProviderBilling/DeleteProviderBilling";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import { toast } from "react-toastify";
import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf";
import Loader from "../../../components/loader/Loader";

const ProviderBillingDetail = () => {
    const { id } = useParams()
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const navigate = useNavigate()

    const paginatedRecords = useMemo(() => paymentHistory.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    ), [paymentHistory, currentPage]);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(paymentHistory.length / recordsPerPage)),
        [paymentHistory]
    );

    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const heading = [
        "Date",
        "Invoice",
        "Description",
        "Amount",
        "Status",
        "Action",
    ];

    const fetchAllData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [contactRes, subscriptionRes, paymentRes] = await Promise.all([
                superAdminApi.getProviderContactInfo(id),
                superAdminApi.getProviderSubscriptionInfo(id),
                superAdminApi.getProviderPaymentHistory(id)
            ]);

            setContactInfo(contactRes.data);
            setSubscription(subscriptionRes.data);
            setPaymentHistory(paymentRes.data || []);
        } catch (error) {
            console.error("Failed to fetch provider details", error);
            toast.error("Failed to load provider details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [id]);

    const formatStatus = (status: string): string => {
        if (!status) return "Unknown";
        const lower = status.toLowerCase();
        switch (lower) {
            case "succeeded": return "Paid";
            case "active": return "Active";
            case "trialing": return "Trial";
            case "pending": return "Pending";
            case "failed": return "Failed";
            case "refunded": return "Refunded";
            case "canceled":
            case "cancelled": return "Canceled";
            case "incomplete": return "Incomplete";
            case "past_due": return "Past Due";
            default: return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }
    };

    const getStatusColor = (status: string) => {
        const label = formatStatus(status);
        switch (label) {
            case "Paid":
            case "Active": return "bg-green-100 text-green-700";
            case "Trial": return "bg-blue-100 text-blue-700";
            case "Pending":
            case "Incomplete": return "bg-yellow-100 text-yellow-700";
            case "Failed":
            case "Past Due": return "bg-red-100 text-red-700";
            case "Refunded":
            case "Canceled": return "bg-gray-100 text-gray-700";
            default: return "bg-inputBgColor text-textColor";
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount / 100);
    };

    const getPlanFeatures = (plan: string) => {
        const lower = plan?.toLowerCase();
        if (lower === 'pro') {
            return [
                "Enhanced Customer Limit",
                "Advanced billing workflows",
                "Priority Support",
                "Partial white-labeling",
                "Standard Integrations",
                "GDPR & HIPAA Compliance"
            ];
        }
        return [
            "Unlimited Customers",
            "Custom billing workflows",
            "Dedicated Account Manager",
            "White-label options",
            "Custom Integrations",
            "Advanced Security & Compliance"
        ];
    };

    const mapPrismaPaymentToInvoice = (data: any) => {
        if (!data) return null;

        const amount = typeof data.amount === 'number' ? data.amount / 100 : 0;
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: data.currency || 'USD'
        }).format(amount);

        return {
            invoiceNo: data.stripeInvoiceId || (data.id ? `INV-2024-${data.id.slice(0, 8)}` : "-"),
            date: formatDate(data.periodStart || data.createdAt),
            dueDate: formatDate(data.periodEnd || data.createdAt),
            billTo: {
                name: contactInfo?.fullName || "Valued Customer",
                email: contactInfo?.email || "",
                address: contactInfo?.address || "-",
                city: `${contactInfo?.state || ""}, ${contactInfo?.country || ""}`
            },
            items: [
                {
                    description: data.plan || "Subscription Payment",
                    subtext: "Platform Access",
                    qty: "01",
                    price: formattedAmount,
                    amount: formattedAmount,
                    status: formatStatus(data.status) || "Paid"
                }
            ],
            subtotal: formattedAmount,
            tax: "$0.00",
            total: formattedAmount,
            notes: "Thank you for your business!"
        };
    };

    if (loading) {
        return <div className="flex flex-col items-center justify-center h-screen">
            <Loader />
        </div>;
    }

    if (!contactInfo) {
        return <div className="p-10 text-center">Provider not found</div>;
    }

    const totalRevenue = paymentHistory.reduce((sum, p) => p.status === 'SUCCEEDED' ? sum + p.amount : sum, 0);

    return (
        <div className="flex flex-col p-2 gap-y-5">
            {/* User Details */}
            <div className="bg-white relative w-full p-4  rounded-[20px] space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div onClick={() => navigate(-1)} className="absolute top-1 left-0 cursor-pointer">
                    <div className="relative group cursor-pointer">



                        <svg width="24" height="24" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g filter="url(#filter0_d_1042_11092)">
                                <circle cx="20.5" cy="16.5" r="16.5" fill="white" />
                                <path d="M24.0017 25.5726C24.2251 25.7757 24.5704 25.7554 24.7736 25.532C24.9767 25.3086 24.9564 24.9632 24.7329 24.7601L16.872 17.6507C16.6689 17.4679 16.6689 17.2039 16.872 17.0211L24.7329 10.1554C24.9564 9.9523 24.9767 9.60699 24.7939 9.38355C24.5907 9.16012 24.2454 9.1398 24.022 9.32262L16.161 16.2086C15.4704 16.8179 15.4501 17.8336 16.1407 18.4632L24.0017 25.5726Z" fill="#434459" />
                            </g>
                            <defs>
                                <filter id="filter0_d_1042_11092" x="0" y="0" width="41" height="41" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                    <feOffset dy="4" />
                                    <feGaussianBlur stdDeviation="2" />
                                    <feComposite in2="hardAlpha" operator="out" />
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1042_11092" />
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1042_11092" result="shape" />
                                </filter>
                            </defs>
                        </svg>


                    </div>


                </div>
                <div className="flex flex-row items-start mt-1.5 justify-between w-full">
                    <div className="flex flex-row items-center gap-x-4">

                        <p className='text-[24px] md:text-[32px] font-semibold '>Provider Billing Details</p>
                    </div>
                    <div className="flex flex-row items-center gap-x-2">
                        <button onClick={() => setShowDeleteModal(true)} className="w-[114px] h-[38px] bg-white border cursor-pointer hover:bg-[#2C9993]/10 border-[#2C9993] rounded-lg flex items-center justify-center gap-x-2">
                            <span className="text-[16px] font-medium text-[#2C9993]">Delete</span>
                            <Trash className="w-[20px] h-[20px] text-[#2C9993] " />
                        </button>
                        <button
                            disabled={true}
                            onClick={() => {
                                navigate(`/provider/refund/${id}`)
                            }} className={`w-[114px] h-[38px] bg-[#2C9993] cursor-not-allowed rounded-lg flex items-center justify-center gap-x-2`}>
                            <span className="text-[16px] font-medium text-white">Refund</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-x-3 w-full">
                    <div
                        className="w-[139px] h-[139px] rounded-full border-[3px] p-1 border-[#FFC600] flex items-center justify-center"
                    >
                        {contactInfo.profileImage ? (
                            <img src={contactInfo.profileImage} className="w-full h-full object-cover rounded-full" alt="" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <User className="w-[60px] h-[60px] text-gray-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className="font-[Poppins] text-[20px] md:text-[24px] font-semibold">{contactInfo.fullName}</p>
                        <p className="font-[Poppins] font-[14px] text-[#666666]">{contactInfo.email}</p>
                        <div className="flex flex-row items-start gap-x-2">
                            <div className="w-[80px] h-[26px] rounded-[4px] bg-[#FAF5FF] flex items-center justify-center">
                                <p className="font-[Poppins] text-[12px] font-medium text-[#9D27B0] capitalize">{subscription?.plan || "Free"}</p>
                            </div>
                            <div className="w-[80px] h-[26px] rounded-[4px] bg-[#ECFDF5] flex items-center justify-center">
                                <p className="font-[Poppins] text-[12px] font-medium text-primaryColorDark capitalize">{subscription?.status || "inactive"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-[20px] space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Contact Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">License No </p>
                            <p className="text-[14px] font-medium">{contactInfo.licenseNo || "-"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Provider Name</p>
                            <p className="text-[14px] font-medium">{contactInfo.fullName || "-"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Total Revenue</p>
                            <p className="text-[18px] font-medium text-[#2C9993]">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Full Name</p>
                            <p className="text-[16px] font-medium">{contactInfo.fullName}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Phone Number</p>
                            <p className="text-[16px] font-medium">{contactInfo.contactNo || "-"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Outstanding Amount</p>
                            <p className="text-[16px] font-medium">$0.00</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Speciality </p>
                            <p className="text-[16px] font-medium">{contactInfo.provider?.department || "Cardiology"}</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <p className="text-[14px] text-(--color-transaction-summary-text)">Payment Method</p>
                            <p className="text-[16px] font-medium">
                                {paymentHistory.find(p => p.paymentMethodLast4)?.paymentMethodLast4
                                    ? `Credit Card **** ${paymentHistory.find(p => p.paymentMethodLast4).paymentMethodLast4}`
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-px bg-[#E2E8F0]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="w-full h-[72px] bg-linear-to-b from-[#ECFDF5] to-[#F0FDF4] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#059669] flex items-center justify-center">
                            <Calendar className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-(--color-transaction-summary-text)">Member Since</p>
                            <p className="text-[12px] font-bold ">{new Date(contactInfo.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="w-full h-[72px] bg-linear-to-b from-[#EFF6FF] to-[#EEF2FF] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#4F46E5] flex items-center justify-center">
                            <Clock className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-(--color-transaction-summary-text)">Last Payment</p>
                            <p className="text-[12px] font-bold ">{paymentHistory[0] ? formatDate(paymentHistory[0].createdAt) : "-"}</p>
                        </div>
                    </div>
                    <div className="w-full h-[72px] bg-linear-to-b from-[#FFFBEB] to-[#FFF7ED] rounded-[12px] p-4 flex items-center gap-x-2.5">
                        <div className="w-[40px] h-[40px] rounded-xl bg-[#D97706] flex items-center justify-center">
                            <FileText className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col items-start justify-center ">
                            <p className="text-[10px] font-normal text-(--color-transaction-summary-text)">Total Invoices</p>
                            <p className="text-[12px] font-bold ">{paymentHistory.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Plan Details */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-[20px] font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full gap-y-3">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Customer Plan Details</p>
                    <div className="flex flex-row w-full gap-x-4">
                        <div className="flex flex-col w-1/3 h-[293px] rounded-[12px] gap-y-3 pt-4 pb-4 pl-4 pr-4 bg-[#2C9993]">
                            <div className="flex items-start justify-between mt-2">
                                <p className="text-[14px] text-white font-medium">Current Plan</p>
                                <div className="w-[91px] h-[24px] rounded-[12px] bg-white/20 flex items-center justify-center">
                                    <p className="text-[12px] text-white z-20 font-medium capitalize">{subscription?.plan || "-s"}</p>
                                </div>
                            </div>
                            <p className="text-[24px] font-bold text-white font-[Poppins] capitalize">{subscription?.plan === 'PRO' ? 'Professional Plus' : (subscription?.plan || 'Standard')}</p>
                            <p className="text-[36px] relative font-bold text-white font-[raleway]">
                                {subscription?.billingCycle === 'YEARLY'
                                    ? (subscription?.plan === 'STANDARD' ? '$95.90' : '$119.88')
                                    : (subscription?.plan === 'PRO' ? '$79' : '$9.99')
                                }
                                <span className={`text-[14px] font-normal absolute ${subscription?.billingCycle === 'YEARLY' ? 'left-[104px]' : 'left-[85px]'} top-[10px] font-[poppins] text-white z-10 `}>
                                    {subscription?.billingCycle === 'YEARLY' ? '/yearly' : '/monthly'}
                                </span>
                            </p>
                            <div className="w-full h-px mt-5 bg-white/20 " />
                            <div className="flex flex-col items-start justify-evenly">
                                <div className="flex flex-row w-full justify-between">
                                    <p className="text-[14px] text-[#D1FAE5] font-normal ">Start Date</p>
                                    <p className="text-[14px] text-white font-medium">{formatDate(subscription?.createdAt)}</p>
                                </div>
                                <div className="flex flex-row w-full justify-between">
                                    <p className="text-[14px] text-[#D1FAE5] font-normal ">Renewal Date</p>
                                    <p className="text-[14px] text-white font-medium">
                                        {subscription?.status === 'TRIALING'
                                            ? formatDate(subscription?.trialEnd)
                                            : formatDate(subscription?.currentPeriodEnd)}
                                    </p>
                                </div>
                                <div className="flex flex-row w-full justify-between">
                                    <p className="text-[14px] text-[#D1FAE5] font-normal ">Auto-Renewal</p>
                                    <p className="text-[14px] text-white font-medium">{subscription?.cancelAtPeriodEnd ? "Disabled" : "Enabled"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-y-5 bg-inputBgColor w-full h-[293px] rounded-[12px] pt-4 pb-4 pl-4 pr-4 overflow-y-auto">
                            <p className="text-[16px] font-medium mt-5" >Plan Features</p>
                            <ul className="flex flex-col gap-y-2" >
                                {getPlanFeatures(subscription?.plan).map((feature, idx) => (
                                    <li key={idx} className="text-[14px] font-normal text-(--color-transaction-summary-text) flex flex-row gap-x-2 items-start">
                                        <Check size={20} className="text-[#2C9993]" /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment history section */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-[20px] space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full">
                    <p className="text-[20px] md:text-[24px] font-semibold pb-4">Payment History</p>
                    <div className="w-full">
                        <Table heading={heading}>
                            {
                                paymentHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 h-[40px] align-middle text-center">
                                            No payment history found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRecords.map((data, idx) => (
                                        <tr
                                            key={data.id || idx}
                                            className="border-b border-b-solid border-b-lightGreyColor"
                                        >
                                            <td className="px-4 py-3 align-middle">
                                                <div className="flex items-center gap-x-4">
                                                    {formatDate(data.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                                <p className="uppercase leading-5 text-[15px] text-[#2C9993] font-medium">{data.stripeInvoiceId || "-"}</p>
                                            </td>
                                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                                {data.plan || "Subscription Payment"}
                                            </td>
                                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                                {formatCurrency(data.amount)}
                                            </td>
                                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                                >
                                                    <GoDotFill
                                                        className="text-base"
                                                    />
                                                    {formatStatus(data.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 align-middle whitespace-nowrap">
                                                <div className="flex items-center justify-start gap-x-2">
                                                    <Eye
                                                        size={24}
                                                        color="#808B97"
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedInvoiceId(data.id);
                                                            setSelectedInvoiceData(mapPrismaPaymentToInvoice(data));
                                                            setShowInvoiceModal(true);
                                                        }}
                                                    />
                                                    <Download
                                                        size={24}
                                                        className="cursor-pointer"
                                                        color="#808B97"
                                                        onClick={async () => {
                                                            const invoice = mapPrismaPaymentToInvoice(data);
                                                            if (invoice) await downloadInvoicePdf(invoice);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    )
                                )
                            }
                        </Table>
                        {totalPages > 1 && (
                            <div className="mt-4">
                                <CustomPagination
                                    totalPages={totalPages}
                                    onPageChange={onPageChange}
                                    hookCurrentPage={currentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                }}
                invoiceId={selectedInvoiceId}
                invoiceData={selectedInvoiceData}
            />
            {showDeleteModal && (
                <DeleteProviderBilling
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={async () => {
                        if (!subscription?.id) throw new Error("No subscription ID found");
                        await superAdminApi.deleteSubscription(subscription.id);
                        navigate("/billing-management");
                    }}
                />
            )}
        </div>
    );
};

export default ProviderBillingDetail;
