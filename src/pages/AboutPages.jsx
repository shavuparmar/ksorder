import { useNavigate } from "react-router-dom"


export default function AboutPages() {
  const navigate = useNavigate();
  return (


    <>
      <div className="text-center 3xl text-black">
        <h1>About Pages</h1>
        <button className="bg-black px-4 py-1 cursor-pointer transition-all  text-white active:scale-95 rounded-lg" onClick={()=>{navigate(-1)}}>Back</button>
        <h2 className="mt-10 bg-red-700 p-10 text-white text-2xl">For Help or issue Regarding Website Please contact to admin or mail to <a href="mailto:shavuparmar63522@gmail.com">Shavuparmar63522@gmail.com</a></h2> 
        

      </div>
    </>
  );
}
