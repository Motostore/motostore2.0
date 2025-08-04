"use client";

import { useState } from "react";
import ImageS3 from "../ui/common/ImageS3";
import PurchaseModal from "./PurchaseModal";
import { error_message } from "../utils/tailwindStyles";
import { pluralizeMonth } from "../lib/utils";

export default function GalleryBaseItem({ item, buttonText }) {
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState();

  const onHire = (item) => {
    setSelected(item);
    setOpenModal(true);
  };

  return (
    <div
      key={item.id}
      className="max-w-sm bg-white border hover:bg-gray-100 border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700 cursor-pointer shadow-xl"
    >
      <div className="p-5 flex items-center justify-center h-48">
        <ImageS3 objectKey={item.image} objectName={item.name} />
      </div>
      <div className="py-2 px-4 mx-auto">
        <div className="flex justify-between items-center">
          <h5
            className={`text-lg font-medium tracking-tight text-gray-900 dark:text-white`}
          >
            {item.name}
          </h5>
          <span className="text-xl text-black font-bold">
            {item.price ? `${item.price}$` : ""}
          </span>
        </div>
        <span className="text-md text-gray-700">
          {pluralizeMonth(item?.duration)}
        </span>
      </div>
      <div>
        {!item.status || item.licenseQuantity === 0 ? (
          <div className="flex flex-col items-center justify-center mb-2">
            {!item.status ? (
              <span className={error_message}>Este servicio esta inactivo</span>
            ) : null}
            {item.licenseQuantity === 0 ? (
              <span className={error_message}>
                Debes configurar las licencias
              </span>
            ) : null}
          </div>
        ) : null}
        {item.status && item.licenseQuantity > 0 ? (
          <div className="flex justify-center items-center h-[50px]">
            <button
              onClick={() => onHire(item)}
              className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg w-full m-2"
            >
              {buttonText}
            </button>
          </div>
        ) : null}
      </div>
      <PurchaseModal
        service={selected}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </div>
  );
}
