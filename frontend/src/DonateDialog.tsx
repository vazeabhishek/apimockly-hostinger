import { forwardRef } from "react";
import qr from "./assets/paypal-qr.jpeg";

export const PAYPAL_URL = "https://www.paypal.me/vazeabhishekd";

interface Props {
  onClose: () => void;
}

export const DonateDialog = forwardRef<HTMLDialogElement, Props>(function DonateDialog({ onClose }, ref) {
  return (
    <dialog ref={ref} className="donate" aria-labelledby="donate-title" onClose={onClose}>
      <h2 id="donate-title">Keep API Mocker free</h2>
      <p>
        API Mocker is free to use. If it saves you time, a small donation helps cover hosting
        and keeps the platform running.
      </p>
      <img src={qr} alt="PayPal QR code for @vazeabhishekd" width={200} height={200} />
      <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer">paypal.me/vazeabhishekd</a>
      <button className="btn-ghost" onClick={() => (ref as React.RefObject<HTMLDialogElement>).current?.close()}>
        Close
      </button>
    </dialog>
  );
});
