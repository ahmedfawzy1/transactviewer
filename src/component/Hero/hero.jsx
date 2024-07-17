import axios from "axios";
import React, { useEffect, useState } from "react";
import "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function Hero() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerResponse = await axios.get("http://localhost:3000/customers");
        setCustomers(customerResponse?.data);
      } catch (error) {
        console.log("Error fetching customers", error);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch transactions when filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        let filteredCustomers = customers;

        // Filter customers by name
        if (nameFilter) {
          filteredCustomers = customers.filter((customer) => customer.name.toLowerCase().includes(nameFilter.toLowerCase()));
        }

        // Get the customer IDs from the filtered customers
        const customerIds = filteredCustomers.map((customer) => customer.id);

        const nameQuery = nameFilter ? `&name_like=${nameFilter}` : "";
        const customerQuery = customerIds.length ? `&customer_id=${customerIds.join("&customer_id=")}` : "";
        const amountQuery = amountFilter ? `&amount=${amountFilter}` : "";
        const transactionsResponse = await axios.get(`http://localhost:3000/transactions?_expand=customer${nameQuery}${customerQuery}${amountQuery}`);
        setTransactions(transactionsResponse?.data);
      } catch (error) {
        console.log("Error fetching transactions", error);
      }
    };

    fetchTransactions();
  }, [nameFilter, customerFilter, amountFilter]);

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((customer) => Number(customer.id) === customerId);
    return customer ? customer.name : "Unkown";
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    const chartData = {};
    transactions.forEach((transaction) => {
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
          {transactions.map((transactions) => (
            <tr key={transactions.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {transactions.id}
              </th>
              <td className="px-6 py-4">{getCustomerName(transactions.customer_id)}</td>
              <td className="px-6 py-4">{transactions.date}</td>
              <td className="px-6 py-4">{transactions.amount}</td>
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
