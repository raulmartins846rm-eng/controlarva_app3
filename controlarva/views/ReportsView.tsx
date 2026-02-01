
import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Users, 
  DollarSign, 
  Layers, 
  RotateCcw,
  Search,
  Loader2,
  LineChart
} from 'lucide-react';
import { Sale, Customer } from '../types';
import { 
  format, 
  isWithinInterval, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  subDays,
  isSameMonth,
  eachMonthOfInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportsViewProps {
  sales: Sale[];
  customers: Customer[];
}

type ReportType = 'overview' | 'customer' | 'value' | 'quantity';

const ReportsView: React.FC<ReportsViewProps> = ({ sales, customers }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<ReportType>('overview');

  const filteredSales = useMemo(() => {
    if (!startDate || !endDate) return sales;
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    return sales.filter(sale => {
      const saleDate = parseISO(sale.date);
      return isWithinInterval(saleDate, { start, end });
    });
  }, [sales, startDate, endDate]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.totalValue, 0);
    const totalLarvae = filteredSales.reduce((acc, s) => acc + s.larvaeQuantity, 0);
    const avgSale = filteredSales.length ? totalRevenue / filteredSales.length : 0;
    const avgPricePerThousand = totalLarvae ? totalRevenue / totalLarvae : 0;
    return { totalRevenue, totalLarvae, avgSale, avgPricePerThousand, count: filteredSales.length };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    if (filteredSales.length === 0) return [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const periodMonths = eachMonthOfInterval({ start, end });
    return periodMonths.map(month => {
      const monthSales = filteredSales.filter(s => isSameMonth(parseISO(s.date), month));
      return {
        name: format(month, 'MMM/yy', { locale: ptBR }),
        vendas: monthSales.reduce((acc, s) => acc + s.totalValue, 0),
        larvas: monthSales.reduce((acc, s) => acc + s.larvaeQuantity, 0),
        count: monthSales.length
      };
    });
  }, [filteredSales, startDate, endDate]);

  const customerRanking = useMemo(() => {
    const ranking: Record<string, { name: string, totalValue: number, totalQuantity: number, orders: number }> = {};
    filteredSales.forEach(sale => {
      if (!ranking[sale.customerId]) {
        ranking[sale.customerId] = { name: sale.customerName, totalValue: 0, totalQuantity: 0, orders: 0 };
      }
      ranking[sale.customerId].totalValue += sale.totalValue;
      ranking[sale.customerId].totalQuantity += sale.larvaeQuantity;
      ranking[sale.customerId].orders += 1;
    });
    return Object.values(ranking).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [filteredSales]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc: any = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Função Auxiliar para Desenhar Gráfico no PDF
      const drawChartInPDF = (
        title: string, 
        data: any[], 
        dataKey: string, 
        startY: number, 
        color: [number, number, number]
      ) => {
        const chartWidth = pageWidth - 40;
        const chartHeight = 50;
        const marginX = 20;
        
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85);
        doc.text(title, marginX, startY - 5);
        
        // Eixos
        doc.setDrawColor(226, 232, 240);
        doc.line(marginX, startY, marginX + chartWidth, startY); // Topo
        doc.line(marginX, startY + chartHeight, marginX + chartWidth, startY + chartHeight); // Base
        
        if (data.length < 2) {
          doc.setFontSize(8);
          doc.text("Dados insuficientes para gerar gráfico de linha.", marginX + chartWidth/2, startY + chartHeight/2, { align: 'center' });
          return startY + chartHeight + 15;
        }

        const maxValue = Math.max(...data.map(d => d[dataKey])) * 1.2 || 1;
        const stepX = chartWidth / (data.length - 1);
        
        // Desenhar Área e Linha
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.5);
        
        const points: [number, number][] = data.map((d, i) => {
          const x = marginX + (i * stepX);
          const y = (startY + chartHeight) - ((d[dataKey] / maxValue) * chartHeight);
          return [x, y];
        });

        // Área preenchida (semi-transparente simulada com cor clara)
        doc.setFillColor(color[0], color[1], color[2]);
        // jsPDF não tem opacidade nativa simples sem plugins GState, então usamos uma cor bem clara
        doc.setFillColor(240, 249, 255); 
        
        let pathStr = `M ${points[0][0]} ${startY + chartHeight}`;
        points.forEach(p => { pathStr += ` L ${p[0]} ${p[1]}`; });
        pathStr += ` L ${points[points.length-1][0]} ${startY + chartHeight} Z`;
        doc.path(pathStr, 'F');

        // Linha principal
        doc.setDrawColor(color[0], color[1], color[2]);
        for(let i=0; i < points.length - 1; i++) {
          doc.line(points[i][0], points[i][1], points[i+1][0], points[i+1][1]);
        }

        // Labels dos Meses (X)
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        data.forEach((d, i) => {
          if (data.length > 6 && i % 2 !== 0) return; // Pula alguns se tiver muitos
          doc.text(d.name, marginX + (i * stepX), startY + chartHeight + 5, { align: 'center' });
        });

        return startY + chartHeight + 20;
      };

      // Header
      doc.setFillColor(14, 165, 233); // Sky-500
      doc.rect(0, 0, pageWidth, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTROLARVA', 15, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Relatório Consolidado de Gestão e Vendas', 15, 30);
      doc.setFontSize(11);
      doc.text(`Período: ${format(parseISO(startDate), 'dd/MM/yyyy')} até ${format(parseISO(endDate), 'dd/MM/yyyy')}`, pageWidth - 15, 25, { align: 'right' });

      // 1. Resumo Executivo
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Resumo Executivo', 15, 60);
      
      doc.autoTable({
        startY: 65,
        head: [['Volume (Milheiros)', 'Ticket Médio / Milheiro', 'Receita Total (R$)', 'Qtd. Vendas']],
        body: [[
          `${stats.totalLarvae.toLocaleString()}`,
          `R$ ${stats.avgPricePerThousand.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          `R$ ${stats.totalRevenue.toLocaleString()}`,
          `${stats.count}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { halign: 'center', fontSize: 11, cellPadding: 5 }
      });

      // 2. Ranking Top 10 Clientes
      doc.setFontSize(16);
      doc.text('2. Ranking: Top 10 Clientes (Volume)', 15, doc.lastAutoTable.finalY + 15);
      
      const top10 = [...customerRanking].slice(0, 10).map((item, idx) => [
        `${idx + 1}º`,
        item.name,
        `${item.totalQuantity.toLocaleString()} milheiros`,
        `R$ ${item.totalValue.toLocaleString()}`,
        item.orders
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Pos.', 'Cliente', 'Volume (Milheiros)', 'Valor Comprado', 'Pedidos']],
        body: top10,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], textColor: 255 },
        columnStyles: { 0: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'center' } }
      });

      // 3. Gráficos de Evolução
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Análise Visual de Desempenho', 15, 20);
      
      let nextY = 35;
      nextY = drawChartInPDF("Evolução de Receita (R$)", chartData, 'vendas', nextY, [14, 165, 233]);
      nextY = drawChartInPDF("Evolução de Volume (Milheiros)", chartData, 'larvas', nextY + 10, [16, 185, 129]);

      // 4. Tabela de Evolução Mensal
      doc.setFontSize(16);
      doc.text('4. Detalhamento Mensal', 15, nextY + 10);
      
      const evolutionData = chartData.map(item => [
        item.name,
        `${item.larvas.toLocaleString()} milheiros`,
        `R$ ${item.vendas.toLocaleString()}`,
        item.count
      ]);

      doc.autoTable({
        startY: nextY + 15,
        head: [['Mês/Ano', 'Volume (Milheiros)', 'Receita Total', 'Vendas']],
        body: evolutionData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'center' } }
      });

      // 5. Registro Detalhado
      doc.addPage();
      doc.setFontSize(16);
      doc.text('5. Registro Detalhado de Transações', 15, 20);
      
      const transactions = filteredSales.map(s => [
        format(parseISO(s.date), 'dd/MM/yy'),
        s.customerName,
        s.larvaeQuantity.toLocaleString(),
        `R$ ${s.totalValue.toLocaleString()}`,
        s.paymentType
      ]);

      doc.autoTable({
        startY: 25,
        head: [['Data', 'Cliente', 'Milheiros', 'Valor Total', 'Pagamento']],
        body: transactions,
        theme: 'striped',
        headStyles: { fillColor: [100, 116, 139], textColor: 255 },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }
      });

      // Rodapés
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${i} de ${pageCount} | Controlarva Inteligência em Aquicultura`, pageWidth / 2, 285, { align: 'center' });
      }

      doc.save(`Relatorio_Executivo_Controlarva_${startDate}_${endDate}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Verifique os dados e tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setStartDate(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setReportType('overview');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold">Relatórios Personalizados</h2>
            <p className="text-slate-500 text-sm">Analise o desempenho das vendas com filtros precisos</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={resetFilters}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              title="Resetar Filtros"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              disabled={isExporting}
              className={`flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50`}
              onClick={handleExportPDF}
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isExporting ? 'Gerando Relatório...' : 'Exportar Relatório PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50 dark:border-slate-700">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
              <Calendar size={12} /> Data Início
            </label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
              <Calendar size={12} /> Data Fim
            </label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-1">
              <Filter size={12} /> Tipo de Relatório
            </label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {(['overview', 'customer', 'value', 'quantity'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all capitalize ${
                    reportType === type 
                      ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {type === 'overview' ? 'Geral' : type === 'customer' ? 'Clientes' : type === 'value' ? 'Valor' : 'Quant.'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-emerald-600">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><Layers size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Volume (Milheiros)</span>
          </div>
          <p className="text-2xl font-black">{stats.totalLarvae.toLocaleString()} milheiros</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-amber-600">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Médio Milheiro</span>
          </div>
          <p className="text-2xl font-black">R$ {stats.avgPricePerThousand.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-sky-600">
            <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg"><DollarSign size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receita Total</span>
          </div>
          <p className="text-2xl font-black">R$ {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-purple-600">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Search size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Qtd. Vendas</span>
          </div>
          <p className="text-2xl font-black">{stats.count}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {(reportType === 'overview' || reportType === 'value' || reportType === 'quantity') && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
             <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
               {reportType === 'quantity' ? <Layers size={20} className="text-emerald-500" /> : <DollarSign size={20} className="text-sky-500" />}
               Evolução: {reportType === 'quantity' ? 'Volume (Milheiros)' : 'Valor de Vendas'}
             </h3>
             <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={reportType === 'quantity' ? '#10b981' : '#0ea5e9'} stopOpacity={0.3}/>
                       <stop offset="95%" stopColor={reportType === 'quantity' ? '#10b981' : '#0ea5e9'} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                   <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                   <Area type="monotone" dataKey={reportType === 'quantity' ? 'larvas' : 'vendas'} stroke={reportType === 'quantity' ? '#10b981' : '#0ea5e9'} strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" name={reportType === 'quantity' ? 'Volume (Milheiros)' : 'Valor Total'} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}

        {reportType === 'customer' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="text-purple-500" /> Ranking de Clientes (Top Compradores)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <th className="px-8 py-4">Posição</th>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4 text-center">Pedidos</th>
                    <th className="px-8 py-4 text-right">Volume (Milheiros)</th>
                    <th className="px-8 py-4 text-right">Total Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {customerRanking.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-8 py-5">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                          {idx + 1}º
                        </span>
                      </td>
                      <td className="px-8 py-5 font-bold">{item.name}</td>
                      <td className="px-8 py-5 text-center">{item.orders}</td>
                      <td className="px-8 py-5 text-right font-medium">{item.totalQuantity.toLocaleString()}</td>
                      <td className="px-8 py-5 text-right font-black text-sky-600">R$ {item.totalValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
