const Card = ({ title, description }) => {
    return (
        <div className="bg-blue-200 rounded-lg">
      <div className="hover:-translate-y-2 delay-75 duration-75 ease-in-out h-full p-6 rounded-lg bg-white ">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      </div>
    );
  };
  
  export default Card;
  