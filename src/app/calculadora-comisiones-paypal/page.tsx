'use client';

import React, { useState } from 'react';

const CalculadoraPaypal: React.FC = () => {
    const [percentage, setPercentage] = useState(5.4);
    const [fee, setFee] = useState(0.3);
    const [recibir, setRecibir] = useState<number>(0);
    const [enviar1, setEnviar1] = useState<number>(0);
    const [comision1, setComision1] = useState<number>(0);
    const [enviar, setEnviar] = useState<number>(0);
    const [comision2, setComision2] = useState<number>(0);
    const [recibir2, setRecibir2] = useState<number>(0);

    const calcularRecibir = () => {
        const montoEnviar = (recibir + fee) / (1 - percentage / 100);
        const comisionRecibir = montoEnviar * (percentage / 100) + fee;

        setEnviar1(parseFloat(montoEnviar.toFixed(2))); // Redondeamos a 2 decimales
        setComision1(parseFloat(comisionRecibir.toFixed(2))); // Redondeamos a 2 decimales
    };

    const calcularEnviar = () => {
        const comisionEnviar = enviar * (percentage / 100) + fee;
        const montoRecibido = enviar - comisionEnviar;

        setComision2(parseFloat(comisionEnviar.toFixed(2))); // Redondeamos a 2 decimales
        setRecibir2(parseFloat(montoRecibido.toFixed(2))); // Redondeamos a 2 decimales
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8 px-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-center text-2xl font-semibold mb-6">Calculadora de Comisiones PayPal</h1>

                <div className="mb-4">
                    <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Comisión PayPal (%):</label>
                    <input
                        type="number"
                        id="percentage"
                        value={percentage}
                        onChange={(e) => setPercentage(parseFloat(e.target.value))}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="fee" className="block text-sm font-medium text-gray-700">Comisión Fija (USD):</label>
                    <input
                        type="number"
                        id="fee"
                        value={fee}
                        onChange={(e) => setFee(parseFloat(e.target.value))}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <h2 className="text-lg font-medium mt-6 mb-4">Calculadora PayPal para Recibir</h2>
                <div className="mb-4">
                    <label htmlFor="recibir" className="block text-sm font-medium text-gray-700">Para Recibir (USD):</label>
                    <input
                        type="number"
                        id="recibir"
                        value={recibir}
                        onChange={(e) => setRecibir(parseFloat(e.target.value))}
                        onBlur={calcularRecibir}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="enviar1" className="block text-sm font-medium text-gray-700">Hay que Enviar (USD):</label>
                    <input type="number" id="enviar1" value={enviar1} disabled className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100" />
                </div>

                <div className="mb-6">
                    <label htmlFor="comision1" className="block text-sm font-medium text-gray-700">La Comisión es de (USD):</label>
                    <input type="number" id="comision1" value={comision1} disabled className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100" />
                </div>

                <h2 className="text-lg font-medium mt-6 mb-4">Calculadora PayPal para Enviar</h2>
                <div className="mb-4">
                    <label htmlFor="enviar" className="block text-sm font-medium text-gray-700">Si se Envían (USD):</label>
                    <input
                        type="number"
                        id="enviar"
                        value={enviar}
                        onChange={(e) => setEnviar(parseFloat(e.target.value))}
                        onBlur={calcularEnviar}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="comision2" className="block text-sm font-medium text-gray-700">La Comisión es de (USD):</label>
                    <input type="number" id="comision2" value={comision2} disabled className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100" />
                </div>

                <div className="mb-6">
                    <label htmlFor="recibir2" className="block text-sm font-medium text-gray-700">Se Reciben (USD):</label>
                    <input type="number" id="recibir2" value={recibir2} disabled className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-100" />
                </div>

                {/* Calculadora de imagen antes de ¿Cómo usar la calculadora de Comisiones PayPal? */}
                <div className="flex justify-center mt-8">
                    <img
                        src="https://paypalfeescalculator.net/wp-content/uploads/2024/12/Calculadora-Taxa-Paypal.jpg"
                        alt="Calculadora PayPal"
                        className="max-w-xs"
                    />
                </div>

                <div className="mt-8">
                    <div className="bg-gray-50 p-6 rounded-lg mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Cómo usar la calculadora de Comisiones PayPal?</h3>
                        <p className="mb-4 text-gray-700">Usar esta calculadora es muy sencillo. Llena el cuadro de texto dependiendo si quieres saber el cálculo para enviar o recibir dinero.</p>
                        <p className="mb-4 text-gray-700">Los bloques solo podrán ser llenados con números. Si deseas agregar un decimal (por ejemplo 10.89) debes hacerlo colocando una coma de esta forma: 10,89.</p>
                        <p className="mb-4 text-gray-700">Por defecto colocamos los valores estándar de las comisiones de PayPal que son 5,4% + un fijo de 0,3 USD por transacción(*). Revisa si tu país tiene una comisión distinta y colócala de forma manual en la parte de &quot;Las Comisiones PayPal&quot;.</p>

                        <h4 className="font-semibold text-gray-800 mt-6 mb-4">¿Monto Bruto y Monto Neto?</h4>
                        <p className="mb-4 text-gray-700">El monto bruto es el dinero enviado o recibido sin contar ningún tipo de comisión. En pocas palabras, es lo que el pagador envía desde su cuenta sin aplicar descuentos.</p>
                        <p className="mb-4 text-gray-700">Por ejemplo: Si te envían 10 USD brutos, te llegarán solamente 9,16 USD netos.</p>

                        <p className="mb-4 text-gray-700">El monto neto es el dinero enviado descontado todo tipo de comisiones. Es decir, lo que llega a destino luego de todos los &quot;recortes&quot;.</p>
                        <p className="mb-4 text-gray-700">Por ejemplo: Si te envían 10 USD netos, realmente el que paga te estará enviado 10,89 USD brutos. La diferencia de los 0,89 son las comisiones de PayPal.</p>

                        <p className="text-gray-700"><strong>(*)Importante:</strong> Esta calculadora no incluye ningún tipo de comisión relacionada a nuestro servicio. Es solo una herramienta de ayuda para el usuario que desea enviar o recibir dinero sin intermediarios a través del sitio web de PayPal.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalculadoraPaypal;































































































