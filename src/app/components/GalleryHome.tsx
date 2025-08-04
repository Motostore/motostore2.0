
import GalleryItem from "./GalleryStreamingItem";

export default function GalleryHome({items, buttonText, className}: { items: any, buttonText: any, className: string }) {

  return (
    <div className={`grid grid-cols-1 ${className} px-4 py-2 md:px-6`}>
    {
      items.length > 0 
      ?
      items.map((item) => (
        <div key={item.id}>
          <GalleryItem item={item} buttonText={buttonText} />
        </div>
      ))
      :
      <div>
          No hay servicios creados
      </div>
    }
    </div>
  )
}