import React, { useState } from "react";
import { PhoneOff, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { appointmentApiService } from "@/services/appointmentApiService";
import { reviewApiService } from "@/services/reviewApiService";
import { RatingStars } from "@/components/shared/RatingStars";

interface CallRoomEndedProps {
  stageMessage: string | null;
  onReturn: () => void;
  appointmentId?: string;
  isProvider?: boolean;
  isAuthenticatedClient?: boolean;
}

export const CallRoomEnded: React.FC<CallRoomEndedProps> = ({
  stageMessage,
  onReturn,
  appointmentId,
  isProvider,
  isAuthenticatedClient,
}) => {
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleSubmitReview = async () => {
    if (!appointmentId || rating < 1) return;
    setIsSubmittingReview(true);
    try {
      await reviewApiService.createReview({
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      });
      setReviewSubmitted(true);
      toast.success("Thanks for your feedback!");
    } catch (error) {
      const message = (error as AxiosError<{ message?: string }>)?.response
        ?.data?.message;
      toast.error(message || "Couldn't submit your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!appointmentId || !notes.trim()) return;
    setIsSaving(true);
    try {
      await appointmentApiService.addSessionNotes(appointmentId, notes.trim());
      setSaved(true);
      toast.success("Session notes saved.");
    } catch (error) {
      const message = (error as AxiosError<{ message?: string }>)?.response
        ?.data?.message;
      toast.error(
        message ||
          "Couldn't save session notes. You can only add notes once the session has ended.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-12 text-center">
      <PhoneOff size={40} className="mx-auto text-gray-400" />
      <h3 className="mt-3 text-lg font-bold text-textColor">Call Ended</h3>
      <p className="mt-1 text-xs text-textGreyColor">
        {stageMessage || "The call session has ended."}
      </p>

      {isProvider && appointmentId && (
        <div className="mx-auto mt-6 max-w-md text-left">
          {saved ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={18} />
              Session notes saved
            </div>
          ) : (
            <>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-textGreyColor">
                Session notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was covered in this session..."
                rows={4}
                className="w-full rounded-2xl border border-gray-200 p-3 text-sm text-textColor outline-none focus:border-primaryColorDark"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onReturn}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-textGreyColor cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!notes.trim() || isSaving}
                  className="rounded-full bg-primaryColorDark px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Confirm & Save Notes"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {isAuthenticatedClient && appointmentId && (
        <div className="mx-auto mt-6 max-w-md text-left">
          {reviewSubmitted ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={18} />
              Review submitted — thank you!
            </div>
          ) : (
            <>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-textGreyColor">
                Rate this session
              </label>
              <div className="flex justify-center py-1">
                <RatingStars value={rating} onChange={setRating} size={26} />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)"
                rows={3}
                className="mt-2 w-full rounded-2xl border border-gray-200 p-3 text-sm text-textColor outline-none focus:border-primaryColorDark"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onReturn}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-textGreyColor cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={rating < 1 || isSubmittingReview}
                  className="rounded-full bg-primaryColorDark px-4 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {(!isProvider || !appointmentId || saved) &&
        !(isAuthenticatedClient && appointmentId && !reviewSubmitted) && (
        <button
          type="button"
          onClick={onReturn}
          className="mt-6 rounded-full bg-primaryColorDark px-5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
};

export default CallRoomEnded;
