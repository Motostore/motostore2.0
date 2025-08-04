export function BadgeItems({ items }) {
return (
    <div className="flex gap-2 flex-wrap justify-end">
    {
    items.map((item, i) => (
        <label key={i} className="inline-flex items-center px-2.5 py-1 text-sx font-medium text-center text-white bg-gray-400 rounded-md focus:ring-4 focus:outline-none">
        {item}
        </label>
    ))
    }
    </div>
);
}

export function BadgeStatus({ status }) {
return (
    <>
    {
    status 
    ?
    <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-green-400 rounded-lg focus:ring-4 focus:outline-none">
    Activo
    </label>
    :
    <label className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-center text-white bg-red-400 rounded-lg focus:ring-4 focus:outline-none">
    Inactivo
    </label>
    }
    </>
);
}