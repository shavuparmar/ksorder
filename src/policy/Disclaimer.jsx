import { useNavigate } from "react-router-dom";

export default function Disclaimer() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-gray-300 p-4">
        <h1 className="text-2xl font-semibold text-center">Disclaimer</h1>
      </div>

      {/* Content Box */}
      <div className="bg-gray-100 text-black p-6 mt-4 mx-4 rounded-xl shadow-lg md:mx-auto md:w-3/4 lg:w-1/2">
        <div className="mt-8 flex mb-5">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-all active:scale-95"
          >
            Back
          </button>
        </div>

        <p className="text-lg mb-4 mt-5">
          The information provided by <strong>Keshav Krupa Dairy</strong>, a
          retail shop selling Sumul Dairy and Sumul Bakery products, is for
          general information and customer convenience only. We do not
          manufacture any dairy or bakery items ourselves.
        </p>

        <ul className="list-disc ml-6 space-y-4 text-lg">
          <li>
            All products are sourced directly from Sumul Dairy and Sumul Bakery.
            We sell them exactly as received from the supplier.
          </li>

          <li>
            Product availability depends on daily stock and supply chain from
            Sumul.
          </li>

          <li>
            We are not responsible for improper handling or storage of products
            after purchase.
          </li>

          <li>
            Any health, taste, or quality issues arising due to customer
            negligence after buying the product will not be our liability.
          </li>

          <li>
            We do not guarantee accuracy of any third-party information linked
            or mentioned in printed or digital formats.
          </li>
        </ul>

        <p className="text-lg mt-6">
          By purchasing from <strong>Keshav Krupa Dairy</strong>, you
          acknowledge and accept this Disclaimer. Thank you for trusting our
          service.
        </p>
      </div>
    </>
  );
}
