import { useNavigate } from "react-router-dom";

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-300 p-4 flex items-center gap-3">
        {/* Back Button */}

        <h1 className="text-2xl font-semibold w-full text-center mr-8">Help</h1>
      </div>

      {/* Content Box */}
      <div className="bg-gray-100 text-black text-lg p-6 shadow-xl mt-4 mx-4 rounded-xl md:mx-auto md:w-3/4 lg:w-1/2">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800 text-white px-4  py-1 rounded-lg cursor-pointer hover:bg-gray-700 transition-all active:scale-95"
        >
          Back
        </button>
        <ul className="flex flex-col gap-6 m-5">
          {/* Email */}
          <li className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="font-medium">Mail to:</span>
            <a
              href="mailto:Parmarshavu009@gmail.com"
              className="text-blue-700 hover:underline break-all"
            >
              Parmarshavu009@gmail.com
            </a>
          </li>

          {/* Phone */}
          <li className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="font-medium">Call Number:</span>
            <a
              href="tel:+919879969598"
              className="text-blue-700 hover:underline"
            >
              +91 98799 69598
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
