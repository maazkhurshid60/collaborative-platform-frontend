import { Calendar, Check, Clock, DeleteIcon, Download, Eye, File, FilePenLine, FileText, Info, Trash, User, View, ViewIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom"
import { GoDotFill } from "react-icons/go";

import Table from "../../../components/table/Table";
import InvoiceModal from "../../../components/modals/InvoiceModal";
import { useState, useEffect } from "react";
import DeleteProviderBilling from "../../../components/modals/superAdminModal/deleteProviderBilling/DeleteProviderBilling";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import { toast } from "react-toastify";

const ProviderBillingDetail = () => {
    const { id } = useParams()
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState<any>(null);
    const [autoDownload, setAutoDownload] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const navigate = useNavigate()

    const heading = [
        "Date",
        "Invoice",
        "Description",
        "Amount",
        "Status",
        "Action",
    ];

    console.log(subscription, "the subscription data is");
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
            console.log(contactRes.data);
            setSubscription(subscriptionRes.data);
            console.log(subscriptionRes.data);
            setPaymentHistory(paymentRes.data || []);
            console.log(paymentRes.data);
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

    const getStatusColor = (status: string) => {
        const lower = status?.toLowerCase();
        switch (lower) {
            case "succeeded":
            case "success": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            case "refunded": return "bg-gray-100 text-gray-700";
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

        const dateObj = data.createdAt ? new Date(data.createdAt) : new Date();
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return {
            invoiceNo: data.stripeInvoiceId || (data.id ? `INV-2024-${data.id.slice(0, 8)}` : "-"),
            date: formattedDate,
            dueDate: formattedDate,
            billTo: {
                name: contactInfo?.fullName || "Valued Customer",
                email: contactInfo?.email || "",
                address: contactInfo?.address || "-",
                city: `${contactInfo?.state || ""}, ${contactInfo?.country || ""}`
            },
            items: [
                {
                    description: data.plan || "Subscription Payment",
                    subtext: "Monthly subscription",
                    qty: "01",
                    price: formattedAmount,
                    amount: formattedAmount,
                    status: data.status || "Paid"
                }
            ],
            subtotal: formattedAmount,
            tax: "$0.00",
            total: formattedAmount,
            notes: "Thank you for your business!"
        };
    };

    if (loading) {
        return <div className="p-10 text-center">Loading provider details...</div>;
    }

    if (!contactInfo) {
        return <div className="p-10 text-center">Provider not found</div>;
    }

    const totalRevenue = paymentHistory.reduce((sum, p) => p.status === 'SUCCEEDED' ? sum + p.amount : sum, 0);

    return (
        <div className="flex flex-col p-5 gap-y-5">

            {/* User Details */}
            <div className="bg-white relative w-full p-4 pt-5 rounded-[20px] space-y-7 font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-row items-start  justify-between w-full">
                    <p className='text-[24px] md:text-[32px] font-semibold mb-3'>Provider Billing Details</p>
                    <div className="flex flex-row items-center gap-x-2">
                        <button onClick={() => setShowDeleteModal(true)} className="w-[114px] h-[38px] bg-white border cursor-pointer border-[#2C9993] rounded-lg flex items-center justify-center gap-x-2">
                            <span className="text-[16px] font-medium text-[#2C9993]">Delete</span>
                            <Trash className="w-[20px] h-[20px] text-[#2C9993] " />
                        </button>
                        <button
                            //   disabled={subscription?.status === "inactive" || true}
                            disabled={true}
                            onClick={() => {
                                navigate(`/provider/refund/${id}`)
                            }} className={`w-[114px] h-[38px] bg-[#2C9993]  cursor-not-allowed rounded-lg flex items-center justify-center gap-x-2`}>
                            <span className="text-[16px] font-medium text-white">Refund</span>
                        </button>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-x-3 w-full">
                    <div
                        className="w-[139px] h-[139px] rounded-full  border-[3px] p-1 border-[#FFC600] flex items-center justify-center"
                    >
                        {contactInfo.profileImage ? (
                            <img src={contactInfo.profileImage} className="w-full h-full  object-cover rounded-full" alt="" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-black flex  items-center justify-center">
                                <User className="w-[60px] h-[60px] text-gray-500  " />
                            </div>
                        )}

                    </div>
                    <div className="flex flex-col items-start gap-y-1">
                        <p className="font-[Poppins] text-[20px] md:text-[24px] font-semibold">{contactInfo.fullName}</p>
                        <p className="font-[Poppins]  font-[14px] text-[#666666]">{contactInfo.email}</p>
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
                            <p className="text-[18px] font-medium text-(--color-transaction-summary-text)">{formatCurrency(totalRevenue)}</p>
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
                                    : "4343"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-[#E2E8F0]" />
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
            {/* Amount and reason input  */}
            <div className="bg-white relative w-full p-4 pt-5  rounded-[20px]  font-[Poppins] text-textColor shadow-sm">
                <div className="flex flex-col items-start justify-between w-full gap-y-3    ">
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
                                    ? (subscription?.plan === 'PRO' ? '$756' : '$313')
                                    : (subscription?.plan === 'PRO' ? '$79' : '$29')
                                }
                                <span className={`text-[14px] font-normal absolute ${subscription?.billingCycle === 'YEARLY' ? 'left-[75px]' : 'left-[60px]'} top-[10px]  font-[poppins] text-white z-10 `}>
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
                                    <p className="text-[14px] text-white font-medium">{formatDate(subscription?.currentPeriodEnd)}</p>
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
                            {paymentHistory.map((data, idx) => (
                                <tr
                                    key={data.id || idx}
                                    className="border-b border-b-solid border-b-lightGreyColor"
                                >
                                    {/* Date */}
                                    <td className="px-2 py-3 align-middle">
                                        <div className="flex items-center gap-x-4">
                                            {formatDate(data.createdAt)}
                                        </div>
                                    </td>

                                    {/* Invoice */}
                                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                                        <p className="uppercase leading-5 text-[15px] text-[#2C9993] font-medium">{data.stripeInvoiceId || "-"}</p>
                                    </td>

                                    {/* Description */}
                                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                                        {data.plan || "Subscription Payment"}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                                        {formatCurrency(data.amount)}
                                    </td>

                                    {/* Status */}
                                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusColor(data.status)}`}
                                        >
                                            <GoDotFill
                                                className="text-base"
                                            />
                                            {data.status}
                                        </span>
                                    </td>

                                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                                        <div className="flex items-center justify-start gap-x-2">
                                            <Download
                                                size={24}
                                                className="cursor-pointer"
                                                color="#808B97"
                                                onClick={() => {
                                                    setSelectedInvoiceId(data.id);
                                                    setSelectedInvoiceData(mapPrismaPaymentToInvoice(data));
                                                    setShowInvoiceModal(true);
                                                    setAutoDownload(true);
                                                }}
                                            />
                                            <Eye
                                                size={24}
                                                color="#808B97"
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    setSelectedInvoiceId(data.id);
                                                    setSelectedInvoiceData(mapPrismaPaymentToInvoice(data));
                                                    setShowInvoiceModal(true);
                                                    setAutoDownload(false);
                                                }}
                                            />

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
            </div>
            <InvoiceModal
                isOpen={showInvoiceModal}
                onClose={() => {
                    setShowInvoiceModal(false);
                    setAutoDownload(false);
                }}
                invoiceId={selectedInvoiceId}
                invoiceData={selectedInvoiceData}
                autoDownload={autoDownload}
            />
            {showDeleteModal && (
                <DeleteProviderBilling onClose={() => setShowDeleteModal(false)} />
            )}
        </div>
    )
}

export default ProviderBillingDetail
