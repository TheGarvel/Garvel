import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Rails from "@rails/ujs";

const Product = (data) => {
  const { sellerImg, productImg, productTitle, productContent, labelList } =
    data;
  return (
    <div className="transition relative rounded overflow-hidden mx-auto shadow hover:shadow-lg hover:scale-110 hover:z-50 group duration-300">
      <img className="w-full" src={productImg} alt="productImg" />
      <div className="flex items-center justify-center overflow-hidden">
        <img
          className="w-10 h-10 bg-gray-400 rounded-full group-hover:rotate-[360deg] transition duration-[600ms]"
          src={sellerImg}
          alt="sellerImg"
        />
      </div>
      <div className="px-6 py-4 bg-gray-300">
        <div className="font-bold text-xl mb-2">{productTitle}</div>
        <p className="text-gray-600 text-base">{productContent}</p>
      </div>
      <div className="px-6 py-4 bg-gray-200">
        {labelList.map((element, idx) => {
          return (
            <span
              key={"label" + idx}
              className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-600 mr-2"
            >
              #{element}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const ProductList = () => {
  const params = useParams();
  const [myArray, setMyArray] = useState([]);
  let dataArray = [];
  useEffect(() => {
    const getData = async () => {
      Rails.ajax({
        type: "get",
        url: `/api/v1/products/categories/${params.id ? params.id : "3C數位"}`,
        success: (productData) => {
          dataArray = [];
          productData.forEach((item) => {
            let data = {};
            data["sellerImg"] = item.seller_image;
            data["productImg"] = item.product_image;
            data["productTitle"] = item.name;
            data["productContent"] = item.description;
            data["labelList"] = ["標籤1", "標籤2", "標籤3", "標籤4", "標籤5"];
            dataArray.push(data);
          });
          setMyArray(() => dataArray);
        },
      });
    };
    getData();
  }, [params]); //<-- This is the dependency array

  return myArray.map((item, idx) => {
    return <Product key={"Product" + idx} {...item} />;
  });
};

export default ProductList;
