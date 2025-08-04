
'use client';

import "./css/mototabs.css";

import { Tabs } from "flowbite-react";
import { HiAdjustments } from "react-icons/hi";
import { useEffect, useState } from "react";
import GalleryRecharges from "./GalleryRecharges";
import GalleryStreaming from "./GalleryStreaming";
import { fetchAllProducts } from "../lib/products.service";
import GalleryBase from "./GalleryBase";
import { useSession } from "next-auth/react";


export default function MyTabs({span}) {

  const { data: session, status } = useSession();
  
  const [streamings, setStreamings] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [marketing, setMarketing] = useState([]);
  const [className, setClassName] = useState('md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4')
  
  useEffect(() => {
    getProducts();
  }, [status]);

  async function getProducts() {
    const { 
      streamings,
      recharges,
      licenses,
      marketing,
    } = await fetchAllProducts();
    console.log(licenses)
    setStreamings(streamings);
    setRecharges(recharges.content);
    setLicenses(licenses);
    setMarketing(marketing.content);

    if (["ADMIN", "SUPERUSER"].includes(session?.user.role)) {
      setClassName('md:grid-cols-2 lg:grid-cols-6 gap-2 md:gap-4')
    }

  }

  return (
    <div className={span}>
      <Tabs aria-label="Tabs with underline" className="bg-white rounded-lg" style="underline">
      <Tabs.Item active title="Streaming" className="dark:text-white  moto-item-tab" icon={HiAdjustments}>
          <GalleryStreaming items={streamings} buttonText={'Comprar'} className={className} />
      </Tabs.Item>
      <Tabs.Item title="Licencias" icon={HiAdjustments}>
          <GalleryBase items={licenses} buttonText={'Comprar'} className={className} />
      </Tabs.Item>
      <Tabs.Item title="Recargas" icon={HiAdjustments}>
          <GalleryRecharges items={recharges} buttonText={'Comprar'} className={className}/>
      </Tabs.Item>
      {/* <Tabs.Item title="Marketing" icon={HiAdjustments}>
          <GalleryBase items={marketing} buttonText={'Comprar'} className={className} />
      </Tabs.Item> */}
      {/* <Tabs.Item disabled title="Divisas" icon={HiAdjustments}>
          <Gallery className={"md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4"} />
      </Tabs.Item>
      <Tabs.Item disabled title="Marketing" icon={HiAdjustments}>
          <Gallery className={"md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4"} />
      </Tabs.Item> */}
      </Tabs>
    </div>
  );
}
