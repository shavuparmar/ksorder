import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-gray-300 p-4">
        <h1 className="text-2xl font-semibold text-center">Privacy Policy</h1>
      </div>

      {/* Content Box */}
      <div className="bg-gray-100 text-black p-6 mt-4 mx-4 rounded-xl shadow-lg md:mx-auto md:w-3/4 lg:w-1/2">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-all active:scale-95"
        >
          Back
        </button>
        <p className="text-lg mb-4 mt-5">
          At <strong>Keshav Krupa Dairy</strong>, we value your privacy. We only
          collect customer details necessary for order management and
          communication.
        </p>

        <ul className="list-disc ml-6 space-y-4 text-lg">
          <li>
            We do not sell, share, or distribute your personal information to
            any third party.
          </li>

          <li>
            Any contact details you provide are used only for confirming your
            orders or solving customer queries.
          </li>

          <li>
            We do not store sensitive payment details (UPI PIN, card info,
            etc.). All payments are processed securely through authorized
            UPI/payment apps.
          </li>

          <li>
            Customers are advised not to share OTPs or private details with
            anyone claiming to be from the shop unless verified directly.
          </li>

          <li>
            We may update this privacy policy anytime to ensure better customer
            protection and transparency.
          </li>
        </ul>

        <p className="text-lg mt-6">
          By purchasing from <strong>Keshav Krupa Dairy</strong>, you agree to
          this Privacy Policy. We are committed to keeping your information safe
          & secure.
        </p>

       
      </div>
    </>
  );
}
