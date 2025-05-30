"use client";

// Define a interface para as props, incluindo os cabeçalhos das colunas
interface DashboardProps {
  headers: string[]; // Array com os nomes dos cabeçalhos das colunas
  data: any[];       // Array com os registros de dados (objetos), podendo conter as flags isSubItem, isCategoryTotal e isGrandTotal
}

// Componente que recebe os cabeçalhos e os dados como parâmetros
const Dashboard = ({ headers, data }: DashboardProps) => {

  if (!data || data.length === 0 || !headers || headers.length === 0) {
    return null; 
  }

  // Função para determinar o alinhamento do texto com base no conteúdo do cabeçalho
  const getAlignment = (header: string): string => {
    const lowerHeader = header.toLowerCase();
    // Verifica por indicadores comuns de valores numéricos
    if (lowerHeader.includes("quantidade") || lowerHeader.includes("valor") || lowerHeader.includes("(kg)") || lowerHeader.includes("(l.)") || lowerHeader.includes("(us$)")) {
      return "text-right"; // Alinha à direita
    } 
    return "text-left"; // Alinha à esquerda
  };

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((header) => (
              <th 
                key={header}
                scope="col" 
                className={`px-6 py-3 ${getAlignment(header)} text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {data.map((item, index) => {
            // Determina o estilo da linha com base nas flags
            let rowClass = "hover:bg-gray-100 dark:hover:bg-gray-600";
            if (item.isGrandTotal) {
              rowClass += " font-bold bg-gray-100 dark:bg-gray-700"; // Negrito e fundo diferenciado para o total geral
            } else if (item.isCategoryTotal) {
              rowClass += " font-semibold"; // Negrito para total por categoria
            }

            return (
              <tr key={index} className={rowClass}>
                {headers.map((header) => {
                  const isProdutoColumn = header.toLowerCase() === 'produto';
                  // Aplica indentação para subitens na coluna 'Produto'
                  const paddingClass = isProdutoColumn && item.isSubItem ? 'pl-10' : 'px-6'; 
                  // Determina a cor do texto (totais mantêm cores padrão)
                  const textColorClass = getAlignment(header) === 'text-right' 
                                        ? 'text-gray-500 dark:text-gray-400' 
                                        : 'text-gray-900 dark:text-white'; // Cor padrão para a coluna 'Produto'

                  return (
                    <td 
                      key={header}
                      className={`${paddingClass} py-4 whitespace-nowrap text-sm ${getAlignment(header)} ${textColorClass}`}
                    >
                      {/* Formata os valores numéricos para exibição */}
                      {getAlignment(header) === 'text-right' 
                        ? (typeof item[header] === 'number' ? item[header].toLocaleString('pt-BR') : (item[header] || '-'))
                        : (item[header] || '-')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
