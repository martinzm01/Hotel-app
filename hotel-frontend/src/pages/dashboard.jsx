import React, { useState, useEffect } from "react"; // <-- IMPORTAMOS useState y useEffect
import { supabase } from "../back_supabase/client"; // <-- IMPORTAMOS TU CLIENTE

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importación estándar
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend, // Importamos Legend para los PieCharts
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  TrendingUp, 
  DollarSign, 
  Bed, 
  LogIn, 
  LogOut, 
  Sun, // <-- ICONO PARA TEMA CLARO
  Moon // <-- ICONO PARA TEMA OSCURO
} from "lucide-react";

// ---------------------- DATOS DE EJEMPLO ELIMINADOS ----------------------
// (Ahora se cargarán desde la BDD)


// --- ETIQUETA CUSTOM PARA PIE CHARTS (Sin cambios) ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


// ---------------------- COMPONENTE PRINCIPAL ----------------------

export default function DashboardPage() {
  // --- STATE PARA EL TEMA ---
  const [theme, setTheme] = useState('dark'); // 'dark' o 'light'

  // --- STATES PARA LOS DATOS (Valores iniciales) ---
  const [kpiData, setKpiData] = useState(null);
  const [ingresosData, setIngresosData] = useState([]);
  const [reservasData, setReservasData] = useState([]);
  const [canalReservaData, setCanalReservaData] = useState([]);
  const [tiposHabitacionData, setTiposHabitacionData] = useState([]);
  const [habitacionesIndividualesData, setHabitacionesIndividualesData] = useState([]);
  const [clientesData, setClientesData] = useState([]);

  // --- STATES DE CARGA Y ERROR ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // --- FUNCIÓN DE CARGA DE DATOS ---
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Llamamos a la única función que creamos en Supabase
        const { data, error } = await supabase.rpc('get_dashboard_analytics');

        if (error) {
          throw error;
        }

        // Asignamos los datos a nuestros estados
        if (data) {
          setKpiData(data.kpis);
          setIngresosData(data.ingresosData);
          setReservasData(data.reservasData);
          setCanalReservaData(data.canalReservaData);
          setTiposHabitacionData(data.tiposHabitacionData);
          setHabitacionesIndividualesData(data.habitacionesIndividualesData);
          setClientesData(data.clientesData);
        }

      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
        setError(err.message || 'Ocurrió un error al cargar los datos.');
      } finally {
        setLoading(false); // Terminamos la carga (con o sin error)
      }
    }

    loadDashboardData();
  }, []); // El array vacío [] asegura que se ejecute solo una vez


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // --- Colores condicionales para gráficos (Sin cambios) ---
  const gridColor = theme === 'dark' ? "#374151" : "#e5e7eb";
  const textColor = theme === 'dark' ? "#9ca3af" : "#6b7280";
  const legendColor = theme === 'dark' ? '#9ca3af' : '#374151';


  // --- MANEJO DE ESTADOS DE CARGA Y ERROR ---
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        {/* Aquí puedes poner un Spinner/Logo */}
        <p className="text-2xl animate-pulse">Cargando analíticas del hotel...</p> 
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-red-400">
        <p className="text-2xl">Error: {error}</p>
      </div>
    );
  }

  // --- RENDER DEL DASHBOARD (Con datos reales) ---
  return (
    <div
      className="flex-grow flex flex-col items-center justify-center text-center  text-white w-full
       bg-cover bg-center bg-no-repeat "
      style={{
        backgroundImage: "url('/assets/piscina del hotel.png')",
        backgroundBlendMode: "darken",
        backgroundColor: "rgba(0,0,0,0.9)",
      }}
    >
      <div className={`min-h-screen transition-colors w-full h-full px-10 ${
        theme === 'dark' 
        ? 'bg-black/0 text-gray-300' 
        : 'bg-gray-50 text-gray-700'
      }`}>
        <main className="container mx-auto px-4 py-10">
          {/* Título del Dashboard y Toggle de Tema (Sin cambios) */}
          <div className="mb-8 mt-10 flex justify-between items-center">
            <div>
              <h1 className={`text-6xl font-medium mt-8 font-serif mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Dashboard de Administración
              </h1>
              <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}>
                Vista general del rendimiento del hotel
              </p>
            </div>
            
            {/* --- BOTÓN DE TOGGLE (Sin cambios) --- */}
            <button 
              onClick={toggleTheme} 
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Sección 1: KPIs (CON DATOS REALES) */}
          <section className="mb-12 mt-10">
            <h2 className={`text-2xl font-semibold mb-6 mt-6 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Indicadores Clave
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Tarjeta 1: Ingresos (Conectada) */}
              <Card className={`shadow-sm hover:shadow-lg transition-shadow rounded-xl ${
                theme === 'dark' ? 'bg-violet-800/30 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-500'
                  }`}>
                    Ingresos del Mes
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {/* USAMOS EL ESTADO CON '?. (optional chaining)' */}
                    AR$ {kpiData?.ingresosDelMes?.toLocaleString() ?? 0}
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 font-medium">
                      +{kpiData?.comparativoMesAnterior ?? 0}%
                    </span>
                    <span className={`ml-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      vs mes anterior
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta 2: Ocupación (Conectada) */}
              <Card className={`shadow-sm hover:shadow-lg transition-shadow rounded-xl ${
                theme === 'dark' ? 'bg-blue-700/40 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-500'
                  }`}>
                    Tasa de Ocupación (Hoy)
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    <Bed className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {kpiData?.tasaOcupacion?.toFixed(1) ?? 0}%
                  </div>
                  <div className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Habitaciones ocupadas actualmente
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta 3: Check-ins (Conectada) */}
              <Card className={`shadow-sm hover:shadow-lg transition-shadow rounded-xl ${
                theme === 'dark' ? 'bg-green-500/60 border-green-950' : 'bg-white border-border'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-500'
                  }`}>
                    Check-ins de Hoy
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'
                  }`}>
                    <LogIn className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {kpiData?.checkInsHoy ?? 0}
                  </div>
                  <div className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Llegadas programadas para hoy
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta 4: Check-outs (Conectada) */}
              <Card className={`shadow-sm hover:shadow-lg transition-shadow rounded-xl ${
                theme === 'dark' ? 'bg-orange-500/30 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-500'
                  }`}>
                    Check-outs de Hoy
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-orange-900/80' : 'bg-orange-100'
                  }`}>
                    <LogOut className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {kpiData?.checkOutsHoy ?? 0}
                  </div>
                  <div className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Salidas programadas para hoy
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Sección 2: Gráficos (CON DATOS REALES) */}
          <section className="mb-12">
            <h2 className={`text-2xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Rendimiento Financiero
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfico: Ingresos (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-stone-800/40 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Ingresos Diarios
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Últimos 30 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      ingresos: {
                        label: "Ingresos (AR$)",
                        color: "#3b82f6", // Azul
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {/* PASAMOS EL ESTADO 'ingresosData' */}
                      <LineChart data={ingresosData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridColor}
                        />
                        <XAxis
                          dataKey="dia"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <YAxis
                          stroke={textColor}
                          tick={{ fill: textColor }}
                          tickFormatter={(value) => `AR$ ${value / 1000}k`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="ingresos"
                          stroke="#3b82f6" // Azul
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico: Reservas Creadas (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-black/50 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Reservas Creadas
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}>
                    Últimos 30 días
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      reservas: {
                        label: "Reservas",
                        color: "#22c55e", // Verde
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {/* PASAMOS EL ESTADO 'reservasData' */}
                      <BarChart data={reservasData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridColor}
                        />
                        <XAxis
                          dataKey="dia"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <YAxis
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="reservas"
                          fill="#6a3794" // Violet
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico: Canal de Reserva (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-stone-black-50 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Canal de Reserva
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Distribución por canal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      cantidad: {
                        label: "Reservas",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* PASAMOS EL ESTADO 'canalReservaData' */}
                        <Pie
                          data={canalReservaData}
                          dataKey="cantidad"
                          nameKey="canal"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          labelLine={false}
                          label={renderCustomizedLabel}
                        >
                          {canalReservaData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ color: legendColor }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico: Clientes Nuevos vs Recurrentes (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-stone-800/40 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Clientes Nuevos vs Recurrentes
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Este mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      cantidad: {
                        label: "Clientes",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        {/* PASAMOS EL ESTADO 'clientesData' */}
                        <Pie
                          data={clientesData}
                          dataKey="cantidad"
                          nameKey="tipo"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          labelLine={false}
                            label={renderCustomizedLabel}
                        >
                          {clientesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ color: legendColor }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Sección 3: Rendimiento de Habitaciones (CON DATOS REALES) */}
          <section className="mb-12">
            <h2 className={`text-2xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Rendimiento de Habitaciones
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfico: Ranking de Tipos de Habitación (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-stone-black/50 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Tipos de Habitación Más Reservados
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Último mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      reservas: {
                        label: "Reservas",
                        color: "#a95de8", // Púrpura
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {/* PASAMOS EL ESTADO 'tiposHabitacionData' */}
                      <BarChart data={tiposHabitacionData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridColor}
                        />
                        <XAxis
                          type="number"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <YAxis
                          type="category"
                          dataKey="tipo"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="reservas"
                          fill="#a855f7" // Púrpura
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Gráfico: Ranking de Habitaciones Individuales (Conectado) */}
              <Card className={`shadow-sm rounded-xl ${
                theme === 'dark' ? 'bg-black/40 border-gray-700' : 'bg-white border-border'
              }`}>
                <CardHeader>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                    Habitaciones Más Reservadas
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    Por número de noches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      noches: {
                        label: "Noches",
                        color: "#f59e0b", // Ámbar
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {/* PASAMOS EL ESTADO 'habitacionesIndividualesData' */}
                      <BarChart
                        data={habitacionesIndividualesData}
                        layout="vertical"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={gridColor}
                        />
                        <XAxis
                          type="number"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <YAxis
                          type="category"
                          dataKey="habitacion"
                          stroke={textColor}
                          tick={{ fill: textColor }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="noches"
                          fill="#f59e0b" // Ámbar
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}