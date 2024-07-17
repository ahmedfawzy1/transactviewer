import React, { useEffect, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function Hero() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");

  // Fetch customers and transactions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data.json");
        const data = await response.json();
        setCustomers(data.customers);
        setTransactions(data.transactions);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((customer) => Number(customer.id) === customerId);
    return customer ? customer.name : "Unknown";
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    const filteredTransactions = transactions.filter((transaction) => {
      const customer = getCustomerName(transaction.customer_id);
      return (
        (!nameFilter || customer.toLowerCase().includes(nameFilter.toLowerCase())) &&
        (!customerFilter || transaction.customer_id === Number(customerFilter)) &&
        (!amountFilter || transaction.amount === Number(amountFilter))
      );
    });

    const chartData = {};
    filteredTransactions.forEach((transaction) => {
      const date = transaction.date;
      if (!chartData[date]) {
        chartData[date] = 0;
      }
      chartData[date] += transaction.amount;
    });

    const labels = Object.keys(chartData);
    const data = Object.values(chartData);

    return {
      labels,
      datasets: [
        {
          label: "Total Transaction Amount",
          data,
          fill: false,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
        },
      ],
    };
  };

  return (
    <div className="relative py-12 overflow-x-auto w-full flex flex-col justify-center items-center">
      <div className="mb-4 max-w-[300px] md:max-w-[800px] flex space-x-4">
        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Filter by Customer ID"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Filter by Amount"
          value={amountFilter}
          onChange={(e) => setAmountFilter(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />
      </div>
      <table className="w-full max-w-[300px] md:max-w-[800px] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs font-extrabold text-gray-900 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Id
            </th>
            <th scope="col" className="px-6 py-3">
              Customer Name
            </th>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions
            .filter((transaction) => {
              const customer = getCustomerName(transaction.customer_id);
              return (
                (!nameFilter || customer.toLowerCase().includes(nameFilter.toLowerCase())) &&
                (!customerFilter || transaction.customer_id === Number(customerFilter)) &&
                (!amountFilter || transaction.amount === Number(amountFilter))
              );
            })
            .map((transaction) => (
              <tr key={transaction.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {transaction.id}
                </th>
                <td className="px-6 py-4">{getCustomerName(transaction.customer_id)}</td>
                <td className="px-6 py-4">{transaction.date}</td>
                <td className="px-6 py-4">{transaction.amount}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="mt-8 w-full max-w-[300px] md:max-w-[800px]">
        <Line data={prepareChartData()} />
      </div>
    </div>
  );
}
