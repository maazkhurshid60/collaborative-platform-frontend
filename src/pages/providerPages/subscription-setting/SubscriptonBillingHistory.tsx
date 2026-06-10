import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { ArrowRight, Download, SquarePen } from "lucide-react";

import { downloadInvoicePdf } from "../../../utils/downloadInvoicePdf";
import { RootState } from "../../../redux/store";
import { formatDate } from "../../../utils/dataTimeUtils";
import { subscriptionApiService } from "../../../services/subscriptionApiService";
import NoBillingHistory from "./NoBillingHistory";

const SubscriptionBillingHistory = () => {
  const navigate = useNavigate();
  const { data: billingHistory } = useQuery({
    queryKey: ["payments"],
    queryFn: subscriptionApiService.getAllPayments,
  });
  const user = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.user,
  );
  const userEmail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails.email,
  );

  const rawPayments: any[] = (billingHistory || []).filter(
    (p: any) => p.status === "paid",
  );
  const emailFromPayment = rawPayments[0]?.billTo?.email;

  const resolvedBillingEmail =
    userEmail && userEmail !== "-" && userEmail !== ""
      ? userEmail
      : emailFromPayment || "-";

  const transformedHistory =
    rawPayments.map((payment: any) => ({
      id: payment.id,
      plan: payment.plan || "Standard",
      amount: payment.rawAmount
        ? `$${payment.rawAmount.toFixed(2)}`
        : payment.amount || "$0.00",
      date: formatDate(payment.createdAt || payment.date),
      status: payment.status || "Paid",
      _raw: payment,
    })) || [];

  const handleDownloadInvoice = async (payment: any) => {
    const raw = payment._raw || payment;
    const invoiceData = {
      invoiceNo:
        raw.invoiceNo ||
        `INV-${raw.id?.split("-")[0]?.toUpperCase() || "0000"}`,
      date: raw.date || formatDate(raw.createdAt),
      dueDate: raw.dueDate || raw.date || formatDate(raw.createdAt),
      billTo: raw.billTo || {
        name: user?.fullName || "-",
        email: resolvedBillingEmail,
        address: user?.address || "-",
        city: "-",
      },
      items: raw.items || [
        {
          description: `${raw.plan || "Standard"} Plan`,
          subtext: `Subscription`,
          qty: "01",
          price: raw.amount || "$0.00",
          amount: raw.amount || "$0.00",
          status: raw.status === "paid" ? "Paid" : "Pending",
        },
      ],
      subtotal: raw.subtotal || raw.amount || "$0.00",
      tax: raw.tax || "$0.00",
      total: raw.total || raw.amount || "$0.00",
      notes: raw.notes || "Thank you for your business!",
    };
    // Download directly — no modal
    await downloadInvoicePdf(invoiceData);
  };

  return (
    <div className="flex flex-col items-start h-auto lg:h-170 gap-y-4 w-full lg:w-1/2 ">
      <div className="w-full h-full flex-1 bg-[#E5E7EB]/50 rounded-2xl p-8.25 mt-2">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          {resolvedBillingEmail && resolvedBillingEmail !== "-" && (
            <div className="w-full flex flex-col items-start justify-between gap-2">
              <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">
                Billing Email
              </p>
              <p
                className="text-[16px] font-medium text-black font-[Poppins] truncate max-w-37.5 sm:max-w-50"
                title={resolvedBillingEmail}
              >
                {resolvedBillingEmail.length > 20
                  ? `${resolvedBillingEmail.slice(0, 20)}...`
                  : resolvedBillingEmail}
              </p>
            </div>
          )}
          {/* 2nd div biling address */}
          <div className="w-full flex flex-col items-start justify-between gap-2">
            <p className="text-[16px] font-normal text-[#666666] font-[Poppins]">
              Billing Address
            </p>
            <p className="text-[16px] font-medium text-black font-[Poppins]">
              {user?.address || "-"}
            </p>
          </div>
        </div>
        <div className="w-full border border-[#E5E7EB] mt-9" />
        <p className="text-[16px] font-medium text-black font-[Poppins] mt-4">
          Billing History
        </p>
        <div className="w-full flex flex-col gap-y-4 mt-5">
          {transformedHistory.length > 0 ? (
            transformedHistory
              .slice(0, 3)
              .map((history: any, index: number) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between bg-white rounded-lg p-4"
                >
                  <div className="flex items-center justify-between gap-x-2">
                    <SquarePen color="#2C9993" size={24} />
                    <div className="flex flex-col items-start justify-between  ">
                      <p className="font-[Poppins] text-[16px] font-medium text-black">
                        {history.date}
                      </p>
                      <p className="font-[Poppins] text-[14px] font-normal capitalize text-[#666666]">
                        {history?.plan}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-x-2">
                    <Download
                      color="#2C9993"
                      size={24}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => handleDownloadInvoice(history)}
                    />
                    <p className="font-[Releway] text-[20px] font-bold leading-1.5 text-black">
                      {history.amount}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <NoBillingHistory />
          )}
        </div>
        {transformedHistory.length > 3 && (
          <button
            onClick={() => navigate("/billing")}
            className="flex flex-row w-full items-center justify-center gap-x-2 cursor-pointer mt-9"
          >
            <p className="font-[Poppins] text-[16px] font-medium text-[#2C9993]">
              View Billing History
            </p>
            <ArrowRight color="#2C9993" size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBillingHistory;
