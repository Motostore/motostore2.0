type GalleryProps = {
  items: any[];
  buttonText: string;
  className: string;
};

export function GalleryLicenses({ items, buttonText, className }: GalleryProps) {
  return (
    <div className={className}>
      <h3>{buttonText}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export function GalleryMarketing({ items, buttonText, className }: GalleryProps) {
  return (
    <div className={className}>
      <h3>{buttonText}</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
