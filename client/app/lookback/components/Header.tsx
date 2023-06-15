
import { HiMenu } from "react-icons/hi";

export const Header = () => {
  return (
    <header className="flex justify-between items-center p-5 bg-gray-900 border-b border-white">
      <h1 className="text-white text-2xl">LookBack</h1>
      <div className="flex items-center hover:bg-gray-500 transition duration-300 cursor-pointer">
        <HiMenu className="text-white text-4xl" />
      </div>
    </header>
  );
};