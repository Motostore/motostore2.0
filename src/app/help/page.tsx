'use client';

import { InformationCircleIcon, QuestionMarkCircleIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './tabs.css';
import Tutorial from '../ui/common/tutorial';
import { Accordion, AccordionItem, AccordionItemButton, AccordionItemHeading, AccordionItemPanel } from 'react-accessible-accordion';  // Correct import
import AccordionMoto from '../ui/common/accordion';
import Gallery from '../components/GalleryStreaming';

export default function Page() {
    return (
        <div className='text-gray-500'>
            <Tabs>
                <TabList>
                    <Tab>
                        <a href="#" className="inline-flex items-center px-4 py-1" aria-current="page" title='¿Cómo funciona?'>
                            <InformationCircleIcon className='w-6 md:w-8 mr-2' />
                            <span className='block md:inline'>¿Cómo funciona?</span>
                        </a>
                    </Tab>
                    <Tab>
                        <a href="#" className="inline-flex items-center px-4 py-1" title="Preguntas frecuentes">
                            <QuestionMarkCircleIcon className='w-6 md:w-8 mr-2' />
                            <span className='block md:inline'>Preguntas frecuentes</span>
                        </a>
                    </Tab>
                    <Tab>
                        <a href="#" className="inline-flex items-center px-4 py-1" title="¿Qué puedo hacer en Moto Store LLC?">
                            <ListBulletIcon className='w-6 md:w-8 mr-2' />
                            <span className='block md:inline'>¿Qué puedo hacer en Moto Store LLC?</span>
                        </a>
                    </Tab>
                </TabList>

                <TabPanel>
                    <div className="shadow-sm text-medium rounded-lg w-full">
                        <div className='rounded-lg py-4'>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 rounded-lg">¿Cómo funciona?</h3>
                            <p className="mb-2">En <strong>Moto Store LLC</strong>, facilitamos el proceso de obtener soluciones digitales eficientes y fáciles de usar. Nuestro sistema está diseñado para ser intuitivo y accesible, permitiendo que nuestros clientes naveguen sin dificultad y encuentren la mejor opción para sus necesidades.</p>
                            <ul>
                                <li><strong>1. Regístrate en nuestra plataforma:</strong> Al registrarte, accedes a un espacio personalizado donde podrás gestionar todas tus operaciones y acceder a las soluciones que ofrecemos.</li>
                                <li><strong>2. Elige el servicio adecuado:</strong> Navega por nuestros servicios y selecciona el que mejor se adapte a tus necesidades. Ofrecemos desde soluciones de marketing digital hasta asesoramiento tecnológico.</li>
                                <li><strong>3. Procesa tu solicitud:</strong> Después de seleccionar el servicio, sigue los pasos que se te indican. Nuestro sistema te guiará de manera clara y eficiente a través de cada etapa.</li>
                                <li><strong>4. Disfruta de los resultados:</strong> Una vez procesada tu solicitud, disfrutarás de los beneficios que nuestras soluciones ofrecen, ayudando a tu empresa a crecer y alcanzar sus metas de manera efectiva.</li>
                            </ul>
                            <Tutorial />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel>
                    <AccordionMoto />
                </TabPanel>

                <TabPanel>
                    <div className="shadow-sm text-medium rounded-lg w-full">
                        <div className='p-2 md:mx-10 my-6'>
                            <h2 className='text-2xl font-bold'>¿Qué puedo hacer en Moto Store LLC?</h2>
                            <p>En <strong>Moto Store LLC</strong>, puedes realizar diversas acciones que incluyen:</p>
                            <Accordion allowZeroExpanded>
                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            ¿Qué servicios ofrece Moto Store LLC?
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>En Moto Store LLC ofrecemos:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Recargas telefónicas.</li>
                                            <li>Servicios digitales para empresas.</li>
                                            <li>Asesoría tecnológica.</li>
                                            <li>Soluciones en marketing digital.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            ¿Cómo puedo aprovechar Moto Store LLC?
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Para aprovechar al máximo los servicios de Moto Store LLC, sigue estos pasos:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Crea tu cuenta para acceder a todos los servicios.</li>
                                            <li>Elige el servicio adecuado según tus necesidades.</li>
                                            <li>Aprovecha el soporte técnico personalizado.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            ¿Qué soluciones digitales puedes encontrar en Moto Store LLC?
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>En Moto Store LLC, ofrecemos las siguientes soluciones digitales:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Recargas móviles.</li>
                                            <li>Servicios de internet satelital.</li>
                                            <li>Pago de facturas.</li>
                                            <li>Licencias digitales y otros servicios innovadores.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Explora los servicios de Moto Store LLC
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Explora los diferentes servicios que ofrecemos:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Servicios de telecomunicaciones.</li>
                                            <li>Pagos digitales.</li>
                                            <li>Soporte técnico especializado.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Todo lo que puedes hacer con Moto Store LLC
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Con Moto Store LLC puedes:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Realizar recargas.</li>
                                            <li>Contratar servicios de internet.</li>
                                            <li>Pagar facturas.</li>
                                            <li>Acceder a soporte técnico personalizado.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Conoce los servicios disponibles en Moto Store LLC
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Disponemos de servicios como:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Recargas.</li>
                                            <li>Pagos.</li>
                                            <li>Asistencia técnica personalizada.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            ¿Cómo puede ayudarte Moto Store LLC?
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Moto Store LLC puede ayudarte a realizar:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Recargas rápidas y seguras.</li>
                                            <li>Acceder a una variedad de servicios digitales.</li>
                                            <li>Obtener soporte técnico confiable y rápido.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Descubre las opciones que te ofrecemos en Moto Store LLC
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>Descubre nuestras opciones de recargas, pagos y acceso a diversas plataformas digitales:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Recargas para diferentes países.</li>
                                            <li>Múltiples formas de pago.</li>
                                            <li>Acceso a plataformas digitales de streaming, juegos y más.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionItemHeading>
                                        <AccordionItemButton>
                                            Servicios y soluciones en Moto Store LLC
                                        </AccordionItemButton>
                                    </AccordionItemHeading>
                                    <AccordionItemPanel>
                                        <p>En Moto Store LLC ofrecemos soluciones integrales para todas tus necesidades digitales:</p>
                                        <ul className="list-disc pl-5">
                                            <li>Servicios de recargas.</li>
                                            <li>Asistencia técnica especializada.</li>
                                            <li>Soluciones innovadoras para empresas y particulares.</li>
                                        </ul>
                                    </AccordionItemPanel>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <Gallery buttonText={''} items={[]} className={"md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4"} />
                    </div>
                </TabPanel>

            </Tabs>
        </div>
    );
}





















