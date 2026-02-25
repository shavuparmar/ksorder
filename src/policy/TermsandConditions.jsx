import { useNavigate } from "react-router-dom";

export default function TermsandConditions() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <div className="bg-gray-300 p-4 flex items-center gap-3">
        

        <h1 className="text-2xl font-semibold w-full text-center mr-8">
          Terms & Conditions
        </h1>
      </div>

      {/* Content Box */}
      <div className="bg-gray-100 text-black p-6 mt-4 mx-4 rounded-xl shadow-lg md:mx-auto md:w-3/4 lg:w-1/2">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800 text-white px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-700 transition-all active:scale-95"
        >
          Back
        </button>

        <h2 className="text-xl font-semibold mt-5 mb-4">
          Keshav Krupa Dairy – Terms & Conditions
        </h2>

        <p className="mb-4 text-lg">
          Welcome to <strong>Keshav Krupa Dairy</strong>, a retail dairy and bakery shop offering fresh
          Sumul Dairy products and Sumul Bakery items. By purchasing from our shop or 
          using our services, you agree to the following terms and conditions.
        </p>

        <ul className="list-disc ml-6 space-y-4 text-lg">

          <li>
            <strong>Product Quality:</strong>  
            All dairy and bakery items we sell are sourced directly from Sumul Dairy 
            and Sumul Bakery. We do not alter, modify, or add anything to the products.
          </li>

          <li>
            <strong>Pricing Policy:</strong>  
            All prices are set according to MRP provided by Sumul. Any discounts (if offered)
            are purely at our discretion.
          </li>

          <li>
            <strong>Freshness Assurance:</strong>  
            We aim to provide always-fresh dairy and bakery items. Customers are advised to 
            check expiry dates and product condition at the time of purchase.
          </li>

          <li>
            <strong>No Return on Perishable Goods:</strong>  
            Dairy and bakery items cannot be returned once sold, unless the product is damaged, 
            expired, or defective at the time of purchase.
          </li>

          <li>
            <strong>Exchange Policy:</strong>  
            Exchange is only valid for items with visible damage or manufacturing defects,
            and must be reported immediately after purchase.
          </li>

          <li>
            <strong>Order & Pickup:</strong>  
            If you place an order for milk, bakery, or dairy products, it must be picked up 
            within the committed time. Unclaimed orders may be cancelled.
          </li>

          <li>
            <strong>Liability:</strong>  
            Keshav Krupa Dairy is not responsible for improper storage of products 
            after purchase, which may affect freshness or quality.
          </li>

          <li>
            <strong>Payment Terms:</strong>  
            We accept cash, UPI, and digital payment methods. Payment must be made in full 
            at the time of purchase.
          </li>

          <li>
            <strong>Customer Conduct:</strong>  
            We expect respectful behaviour toward staff and other customers. Any misuse of 
            services may lead to refusal of service.
          </li>

          <li>
            <strong>Policy Updates:</strong>  
            Keshav Krupa Dairy reserves the right to update terms and conditions anytime 
            without prior notice.
          </li>

        </ul>

        <p className="text-lg mt-6">
          Thank you for choosing <strong>Keshav Krupa Dairy</strong>. We always aim to provide you
          the best quality dairy and bakery products from Sumul.
        </p>

      </div>
    </>
  );
}
