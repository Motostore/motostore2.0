import { Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel } from "react-accessible-accordion";
import 'react-accessible-accordion/dist/fancy-example.css';

export default function AccordionMoto() {

    return (
        <Accordion allowZeroExpanded>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Cómo funciona el servicio de Recargas Telefónicas?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Realiza recargas de saldo para cualquier operador de telefonía móvil en Colombia, Venezuela, Ecuador, Perú y Chile. El proceso es fácil y seguro, y puedes hacerlo desde cualquier lugar.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Cómo me registro para obtener los servicios?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Puedes registrarte directamente en nuestra plataforma, donde podrás gestionar todas tus operaciones y acceder a los servicios de manera sencilla y rápida.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Qué métodos de pago aceptan?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Aceptamos una variedad de métodos de pago, incluyendo tarjetas de crédito y débito, transferencias bancarias y pagos en línea, para facilitar tu experiencia.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Puedo realizar recargas para otros países?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Actualmente, nuestras recargas están disponibles para Venezuela, Colombia, Ecuador, Perú y Chile, pero estamos trabajando para ampliar el servicio a más países en el futuro cercano.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        ¿Ofrecen soporte al cliente?
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                    <p>
                    Sí, ofrecemos soporte al cliente las 24 horas, los 7 días de la semana, para ayudarte con cualquier pregunta o problema relacionado con nuestros servicios.
                    </p>
                </AccordionItemPanel>
            </AccordionItem>
        </Accordion>
    )
}





