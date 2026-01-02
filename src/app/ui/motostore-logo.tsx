import Image from 'next/image';

export default function MotostoreLogo() {
  return (
    <Image
        src="/motostore-logo.png"
        width={120}
        height={150}
        className='m-auto sm:m-0'
        alt='Website logo'
    />
  );
}
