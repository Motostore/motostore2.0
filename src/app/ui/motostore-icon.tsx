import Image from 'next/image';

export default function MotostoreIcon() {
  return (
    <Image
        src="/motostore-logo.png"
        width={80}
        height={80}
        className='m-auto sm:m-0'
        alt='Website logo'
    />
  );
}
