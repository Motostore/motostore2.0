// src/app/ui/footer.tsx
'use client';

import MotostoreLogo from "./motostore-logo";
import { SocialIcon } from "react-social-icons";

export default function Footer() {
  const whatsapp = "13522248881";
  const instagram = "motostorellc";
  const tiktok = "motostorellc2"; // ← actualizado

  return (
    <div className="bg-white px-2 lg:px-16 border-t-2">
      <div className="w-full m-auto py-4">
        <div className="flex sm:flex-row flex-col justify-between items-center text-center sm:text-left">
          {/* LOGO INFERIOR + TEXTO (sin check) */}
          <div className="flex flex-col items-center justify-center p-4 md:h-40 w-full md:w-4/12">
            <MotostoreLogo />
            <p className="text-center text-sm text-gray-700 mt-2 font-medium">
              Moto Store LLC | Soluciones Digitales 24/7
            </p>
          </div>

          {/* REDES SOCIALES */}
          <div className="text-center mb-3 w-full md:w-4/12">
            <div>
              <h4 className="font-bold">Redes sociales</h4>
              <div className="flex justify-center gap-4">
                {/* WhatsApp */}
                <div className="flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300">
                  <SocialIcon
                    target="_blank"
                    rel="noopener noreferrer"
                    bgColor="white"
                    fgColor="#25D366"
                    network="whatsapp"
                    style={{ height: "60px", width: "60px" }}
                    url={`https://wa.me/${whatsapp}`}
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300">
                  <SocialIcon
                    target="_blank"
                    rel="noopener noreferrer"
                    bgColor="white"
                    fgColor="#E1306C"
                    network="instagram"
                    style={{ height: "60px", width: "60px" }}
                    url={`https://www.instagram.com/${instagram}?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==`}
                  />
                </div>

                {/* TikTok (actualizado) */}
                <div className="flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300">
                  <SocialIcon
                    target="_blank"
                    rel="noopener noreferrer"
                    bgColor="white"
                    fgColor="#000000"
                    network="tiktok"
                    style={{ height: "60px", width: "60px" }}
                    url={`https://www.tiktok.com/@${tiktok}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center">
          <p className="font-bold">
            © Copyright 2020. All Rights Reserved By Moto Store LLC
          </p>
        </div>
      </div>
    </div>
  );
}









































