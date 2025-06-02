"use client";

import Dashboard from '@/components/Dashboard/index';
import { fetchData } from '@/services/api'; 
import { useEffect, useState } from 'react';

// Tipo para a estrutura bruta da resposta da API
type ApiData = {
  [dataType: string]: any[]; // Array contendo objetos de tabela
};

// Tipo para uma tabela processada pronta para exibição
interface ProcessedTable {
  title: string;
  headers: string[]; // Armazena os cabeçalhos reais dessa tabela
  data: any[]; // Array de registros da tabela
}

// Função auxiliar para limpar e converter valores numéricos
const parseNumericValue = (value: any): number => {
  if (value === null || value === undefined || value === '-') {
    return 0;
  }
  const stringValue = String(value)
    .replace(/\(.*?\)/g, '') // Remove conteúdo entre parênteses (ex: Kg, US$)
    .replace(/\./g, '')      // Remove separadores de milhar
    .replace(',', '.')       // Substitui vírgula decimal por ponto
    .trim();
  
  if (stringValue === '') {
    return 0;
  }

  const parsed = Number(stringValue);
  return isNaN(parsed) ? 0 : parsed;
};

export default function HomePage() {
  const MAX_YEAR = 2023;
  const MIN_YEAR = 1970;
  const [year, setYear] = useState<string>(MAX_YEAR.toString()); 
  const [dataType, setDataType] = useState<string>(''); 
  const [allData, setAllData] = useState<ApiData | null>(null); 
  const [availableDataTypes, setAvailableDataTypes] = useState<string[]>([]); 
  const [processedTables, setProcessedTables] = useState<ProcessedTable[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Efeito para buscar dados sempre que o ano for alterado
  useEffect(() => {
    const loadData = async () => {
      if (!year) return;
      setLoading(true);
      setError('');
      setAllData(null); 
      setAvailableDataTypes([]);
      setProcessedTables([]);
      setDataType(''); 

      try {
        const response = await fetchData(year);
        console.log('Resposta da API:', response);

        // Check if response and response.data exist and response.data is an object
        if (response && typeof response.data === 'object' && response.data !== null && !Array.isArray(response.data)) {
          
          // --- DYNAMIC PAYLOAD DETECTION ---
          let dataPayload: ApiData | null = null;
          let potentialNestedPayload: unknown = response.data.data; // Use unknown for initial check

          // Check if the nested structure exists and is a valid object
          if (potentialNestedPayload && typeof potentialNestedPayload === 'object' && !Array.isArray(potentialNestedPayload)) {
            console.log("Detected nested data structure (response.data.data).");
            // Check if this nested level itself contains a 'data' key and it's an object, indicating deeper nesting
            if ('data' in potentialNestedPayload && potentialNestedPayload.data && typeof potentialNestedPayload.data === 'object' && !Array.isArray(potentialNestedPayload.data)) {
                console.log("Detected DEEPER nested structure (response.data.data.data). Using this as payload.");
                dataPayload = potentialNestedPayload.data as ApiData; // Go one level deeper
            } else {
                 console.log("Using response.data.data directly as payload (no deeper 'data' object found).");
                 dataPayload = potentialNestedPayload as ApiData; // Use the current level
            }
          } else {
            // If nested structure is invalid or missing, try the direct structure (local)
            let potentialDirectPayload: unknown = response.data;
            if (potentialDirectPayload && typeof potentialDirectPayload === 'object' && !Array.isArray(potentialDirectPayload)) {
              // Basic check: does it look like our data structure?
              const keys = Object.keys(potentialDirectPayload);
              if (keys.includes('Comercialização') || keys.includes('Produção') || keys.includes('Processamento') || keys.includes('Importação') || keys.includes('Exportação')) {
                 console.log("Detected direct data structure (response.data).");
                 dataPayload = potentialDirectPayload as ApiData;
              } else {
                 console.warn("Direct response.data does not seem to contain expected data types.");
              }
            }
          }
          // --- END DYNAMIC PAYLOAD DETECTION ---

          // Now, check if we successfully identified a valid dataPayload
          if (dataPayload && typeof dataPayload === 'object' && !Array.isArray(dataPayload)) {
            const actualData = dataPayload as ApiData; // Use the identified payload

            // Check for the specific nested '0' case (keeping the handling for now)
            // IMPORTANT: This '0' check should ideally happen *after* confirming actualData has valid types
            if ('0' in actualData && Object.keys(actualData).length === 1 && typeof actualData['0'] === 'object' && !Array.isArray(actualData['0'])) {
               console.warn("Backend retornou dados aninhados sob '0'. Tentando corrigir.");
               const correctedData = actualData['0'] as ApiData;
               // Ensure keys are extracted from the *corrected* data here
               const rawTypes = Object.keys(correctedData);
               const validTypes = rawTypes.filter(key => key !== 'data'); // Filter out 'data' key
               console.log("DEBUG: Extracted types (keys) from corrected '0' data:", rawTypes);
               console.log("DEBUG: Valid types after filtering:", validTypes);
               setAllData(correctedData);
               setAvailableDataTypes(validTypes);
               // Set initial type based on filtered list
               setDataType(validTypes.includes('Comercialização') ? 'Comercialização' : validTypes[0] || '');
            } else if (Object.keys(actualData).length > 0) {
               // Standard case: Use the actualData directly
               const rawTypes = Object.keys(actualData); // Extract keys from the correct payload
               const validTypes = rawTypes.filter(key => key !== 'data'); // Filter out 'data' key
               console.log("DEBUG: Extracted types (keys) from actualData:", rawTypes);
               console.log("DEBUG: Valid types after filtering:", validTypes);
               setAllData(actualData);
               setAvailableDataTypes(validTypes);
               // Set initial type based on filtered list
               setDataType(validTypes.includes('Comercialização') ? 'Comercialização' : validTypes[0] || '');
            } else {
               // The identified data payload is empty
               setError(`Nenhum dado encontrado para o ano ${year}.`);
               setAllData({}); // Keep as empty object if payload was valid but empty
               setAvailableDataTypes([]);
               setDataType(''); // Reset data type
            }
          } else {
            // Handle cases where neither response.data.data nor response.data was a valid payload
            console.error('Não foi possível identificar uma estrutura de dados válida na resposta da API:', response.data);
            setError(`Estrutura de dados inválida ou inesperada recebida da API para o ano ${year}.`);
            setAllData(null);
            setAvailableDataTypes([]);
          }
        } else {
          // Handle cases where response.data itself is invalid or missing
          console.error('response.data da API não é um objeto válido ou não existe:', response?.data);
          setError(`Resposta inválida da API para o ano ${year}.`);
          setAllData(null);
          setAvailableDataTypes([]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        let errorMessage = "Ocorreu um erro inesperado ao buscar os dados.";
        if (err instanceof Error) {
            if (err.message.toLowerCase().includes("timeout")) {
                errorMessage = `A requisição para o backend demorou muito (${err.message}). Verifique se o servidor backend está respondendo ou se o processo de scraping está muito lento.`;
            } else if (err.message.includes("Resposta da API sem dados")) {
                errorMessage = `Nenhum dado retornado pela API para o ano ${year}. Verifique o backend.`;
            } else {
                errorMessage = `Erro ao buscar dados: ${err.message}`; // More generic fetch error
            }
        }
        setError(errorMessage);
        setAllData(null); // Set to null instead of {}
        setAvailableDataTypes([]);
        setDataType(""); // Reset data type as well
        setProcessedTables([]); // Clear processed tables too
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [year]);

  // --- EFEITO FINAL: Lida com Item/SubItem, Total Geral (existente ou calculado) ---
  useEffect(() => {
    // Clear previous tables and errors related to processing
    setProcessedTables([]);
    // Do not clear the main fetch error here, only processing errors

    // Check if we have valid data and a selected data type
    if (!allData || typeof allData !== 'object' || Array.isArray(allData) || !dataType) {
      setProcessedTables([]); // Ensure it's cleared if basic conditions fail
      // console.log("DEBUG: Processing skipped - no valid allData or dataType.");
      return;
    }

    try {
      const tablesContainer = allData[dataType];
      const newProcessedTables: ProcessedTable[] = [];

      // Explicitly check if the data for the selected type exists and is an array
      if (!tablesContainer || !Array.isArray(tablesContainer)) {
        console.warn(`Dados para o tipo '${dataType}' não encontrados ou não são um array em allData. Valor:`, tablesContainer);
        // Set error specific to processing this data type, keeping fetch errors if they exist
        // setError(prevError => prevError || `Nenhuma tabela encontrada ou dados inválidos para o tipo '${dataType}' no ano ${year}.`);
        setProcessedTables([]); // Ensure tables are empty
        return; // Stop processing if the container is invalid
      }

      // Define tipos que precisam de total calculado
      const typesForCalculatedTotal = ["Produção", "Comercialização", "Processamento"];

      // This check is now slightly redundant due to the one above, but harmless
      if (Array.isArray(tablesContainer)) {
        tablesContainer.forEach((tableObject, index) => {
          if (typeof tableObject === 'object' && tableObject !== null) {
            const keys = Object.keys(tableObject);
            if (keys.length > 0) {
              const tableTitle = keys[0];
              const rawData = tableObject[tableTitle];

              if (Array.isArray(rawData) && rawData.length > 0) {
                let headers: string[];
                let formattedData: any[];
                const firstItem = rawData[0];
                let grandTotalExists = false; // Verifica se já existe uma linha de 'Total'

                const hasItemSubItemStructure = 
                  typeof firstItem === 'object' && firstItem !== null &&
                  'Item' in firstItem && 
                  'SubItem' in firstItem && 
                  'Quantidade' in firstItem;

                if (hasItemSubItemStructure) {
                  const quantityHeader = Object.keys(firstItem).find(k => k.toLowerCase().includes('quantidade')) || 'Quantidade';
                  headers = ['Produto', quantityHeader]; 
                  let calculatedTotal = 0;
                  
                  formattedData = rawData.map((item: any) => {
                    const isSubItem = item.Item !== item.SubItem && item.SubItem !== '-';
                    const isCategoryTotal = item.Item === item.SubItem; 
                    const isGrandTotal = item.Item === 'Total'; 
                    if (isGrandTotal) grandTotalExists = true;
                    
                    const quantityValue = parseNumericValue(item.Quantidade);
                    // Soma os totais por categoria
                    if (isCategoryTotal) {
                        calculatedTotal += quantityValue;
                    }

                    return {
                      'Produto': isGrandTotal ? 'Total' : (item.SubItem && item.SubItem !== '-' ? item.SubItem : item.Item || '-'),
                      [quantityHeader]: quantityValue,
                      'isSubItem': isSubItem,
                      'isCategoryTotal': isCategoryTotal, 
                      'isGrandTotal': isGrandTotal 
                    };
                  });

                  // Adiciona a linha de total calculado SOMENTE se o tipo exigir E não existir total
                  if (typesForCalculatedTotal.includes(dataType) && !grandTotalExists) {
                      formattedData.push({
                          'Produto': 'Total',
                          [quantityHeader]: calculatedTotal,
                          'isSubItem': false,
                          'isCategoryTotal': false,
                          'isGrandTotal': true
                      });
                  }

                } else {
                  // Tratamento padrão para outras tabelas (ex: Exportação/Importação)
                  headers = Object.keys(firstItem);
                  formattedData = rawData.map((item: any) => {
                    if (typeof item !== 'object' || item === null) return null;
                    const processedItem: { [key: string]: any } = {};
                    const isGrandTotal = headers.length > 0 && item[headers[0]] === 'Total';
                    processedItem['isGrandTotal'] = isGrandTotal;

                    headers.forEach(header => {
                      const isLikelyNumeric = headers.indexOf(header) === headers.length - 1 || 
                                              header.toLowerCase().includes('quantidade') || 
                                              header.toLowerCase().includes('valor');
                      
                      if (isLikelyNumeric) {
                        processedItem[header] = parseNumericValue(item[header]);
                      } else {
                        processedItem[header] = item[header] !== null && item[header] !== undefined ? String(item[header]) : '-';
                      }
                    });
                    return processedItem;
                  }).filter(item => item !== null);
                }

                newProcessedTables.push({ title: tableTitle.trim(), headers: headers, data: formattedData as any[] });
              } else {
                console.warn(`Dados da tabela '${tableTitle}' (índice ${index}) em '${dataType}' estão vazios ou não são um array.`);
                 if (Array.isArray(rawData)) {
                    newProcessedTables.push({ title: tableTitle.trim(), headers: [], data: [] });
                 }
              }
            } else {
              console.warn(`Objeto da tabela no índice ${index} em '${dataType}' não possui chaves.`);
            }
          } else {
            console.warn(`Item no índice ${index} em '${dataType}' não é um objeto.`);
          }
        });
      } else {
        // ADDED DEBUG LOG:
        console.log("DEBUG: Processing dataType:", dataType, " | tablesContainer value:", tablesContainer);
        // ADDED TYPE CHECK LOG:
        console.log("DEBUG: Type of tablesContainer:", typeof tablesContainer);
        console.warn(`Conteúdo de '${dataType}' não é um array como esperado.`);
      }

      setProcessedTables(newProcessedTables);

    } catch (err) {
      console.error(`Erro ao processar dados de ${dataType}:`, err);
      setError(`Erro ao processar os dados de ${dataType}.`);
      setProcessedTables([]);
    }

  }, [allData, dataType]);

  const yearOptions = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white flex flex-col">
      <header className="bg-gray-800 text-white p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-center sm:text-left">Análise Vitivinícola Embrapa</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            id="dataType-select"
            name="dataType"
            aria-label="Seletor de tipo de dado"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            disabled={loading || availableDataTypes.length === 0}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- Selecione o Tipo --</option>
            {availableDataTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            id="year-select"
            name="year"
            aria-label="Seletor de ano"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <option value="" disabled>-- Selecione o Ano --</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Carregando dados para {year}...</p>
          </div>
        )}

        {!loading && !error && processedTables.length > 0 && (
          <div className="space-y-8">
            {processedTables.map((table, index) => (
              <div key={`${dataType}-${year}-${index}`} className="bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                  {table.title}
                </h2>
                {table.data.length > 0 && table.headers.length > 0 ? (
                  <Dashboard headers={table.headers} data={table.data} /> 
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Nenhum dado válido encontrado para exibir nesta tabela ({table.title}).
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && dataType && processedTables.length === 0 && allData && (
             <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                 <span className="block sm:inline">Nenhuma tabela encontrada ou dados inválidos para {dataType} no ano {year}.</span>
            </div>
        )}

        {!loading && !error && availableDataTypes.length === 0 && allData && (
             <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                 <span className="block sm:inline">Nenhum tipo de dado encontrado para o ano {year}.</span>
            </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white text-center p-3 mt-auto">
        <p>© {new Date().getFullYear()} GrapeIQ Analysis</p>
      </footer>
    </div>
  );
}

