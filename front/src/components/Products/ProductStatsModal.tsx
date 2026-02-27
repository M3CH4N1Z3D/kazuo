import React, { useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IProduct } from "@/interfaces/types";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import jsPDF from "jspdf";

interface ProductStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}

const ProductStatsModal: React.FC<ProductStatsModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { t } = useTranslation("global");
  const chartRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  // Data for Stock Pie Chart
  const stockData = [
    { name: t("products.quantity"), value: Number(product.quantity) },
    { name: t("products.minStock"), value: Number(product.minStock) },
  ];
  const COLORS = ["#0088FE", "#FF8042"];

  // Data for Price Comparison (Proxy for Trend/Financials since no history)
  const priceData = [
    {
      name: t("products.prices"),
      buyPrice: Number(product.inPrice),
      sellPrice: Number(product.outPrice),
      margin: Number(product.outPrice) - Number(product.inPrice),
    },
  ];

  // Mock History Data for "Trend" (Since backend doesn't provide history yet)
  // Generating a simple upward/downward trend based on creation date would be complex without real data.
  // We will show a placeholder line chart with current data points to satisfy the UI requirement.
  const historyData = [
    { name: "Creation", stock: Number(product.quantity) * 0.5, price: Number(product.outPrice) * 0.9 },
    { name: "Month 1", stock: Number(product.quantity) * 0.7, price: Number(product.outPrice) * 0.95 },
    { name: "Current", stock: Number(product.quantity), price: Number(product.outPrice) },
  ];

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(`${t("products.statsReport")}: ${product.name}`, 20, 20);
    
    // Basic Info
    doc.setFontSize(12);
    doc.text(`${t("products.date")}: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`${t("products.quantity")}: ${product.quantity} ${product.unids}`, 20, 40);
    doc.text(`${t("products.minStock")}: ${product.minStock}`, 20, 50);
    doc.text(`${t("products.buyPrice")}: ${product.inPrice} ${product.bange}`, 20, 60);
    doc.text(`${t("products.sellPrice")}: ${product.outPrice} ${product.bange}`, 20, 70);

    // Note about charts
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(t("products.pdfChartNote"), 20, 90);

    doc.save(`${product.name}_stats.pdf`);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-medium leading-6 text-gray-900"
                  >
                    {product.name} - {t("products.statistics")}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={chartRef}>
                  {/* Basic Info Card */}
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm col-span-1 md:col-span-2 flex flex-wrap justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">{t("products.creationDate")}</p>
                      <p className="font-semibold">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t("products.currentStock")}</p>
                      <p className="font-semibold text-xl text-blue-600">{product.quantity} {product.unids}</p>
                    </div>
                    <div>
                       <p className="text-sm text-gray-500">{t("products.minStock")}</p>
                       <p className="font-semibold text-red-500">{product.minStock}</p>
                    </div>
                     <button
                      onClick={handleGeneratePDF}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                      {t("products.downloadReport")}
                    </button>
                  </div>

                  {/* Stock Distribution Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm h-80">
                    <h4 className="text-lg font-semibold mb-4 text-center">{t("products.stockDistribution")}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Price Analysis Chart */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm h-80">
                    <h4 className="text-lg font-semibold mb-4 text-center">{t("products.priceAnalysis")}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="buyPrice" fill="#82ca9d" name={t("products.buyPrice")} />
                        <Bar dataKey="sellPrice" fill="#8884d8" name={t("products.sellPrice")} />
                        <Bar dataKey="margin" fill="#ffc658" name={t("products.margin")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Mock History Chart (Placeholder for Future Implementation) */}
                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm col-span-1 md:col-span-2 h-80">
                    <h4 className="text-lg font-semibold mb-4 text-center">{t("products.historyTrend")} (Simulated)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="stock" stroke="#8884d8" name={t("products.stockHistory")} />
                        <Line type="monotone" dataKey="price" stroke="#82ca9d" name={t("products.priceHistory")} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProductStatsModal;
