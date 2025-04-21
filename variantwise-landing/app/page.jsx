"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://your-api-endpoint.com/api";

const computeComfort = (car) => {
  const scores = [
    car.front_seat_comfort_score,
    car.rear_seat_comfort_score,
    car.bump_absorption_score,
    car.material_quality_score,
  ];
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
};

export default function Home() {
  const [prefs, setPrefs] = useState({
    minBudget: 500000,
    maxBudget: 2000000,
    fuel: "Any",
    body: "Any",
    transmission: "Any",
    seating: 5,
    features: [],
    performance: 5,
  });

  const [results, setResults] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasSearched && question.trim() === "") {
      setChatResponse("");
    }
  }, [question, hasSearched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prefs.minBudget > prefs.maxBudget) {
      alert("Minimum budget cannot be greater than maximum budget");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/recommendations`, prefs);
      setResults(response.data);
      setHasSearched(true);
    } catch (err) {
      console.error("Recommendation error:", err);
      setError("Failed to get recommendations. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question,
        cars: results,
      });
      setChatResponse(response.data.answer);
    } catch (err) {
      console.error("Chat error:", err);
      setChatResponse("Sorry, I couldn't process your question. Please try again.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-black to-black text-white min-h-screen px-4 py-6 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🚗 Smart Car Recommender</h1>

      {!hasSearched ? (
        <form onSubmit={handleSubmit} className="bg-[#111827] p-6 rounded-xl shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" type="number" required value={prefs.minBudget} onChange={(e) => setPrefs(prev => ({ ...prev, minBudget: parseInt(e.target.value) }))} placeholder="Min Budget (₹)" />
            <input className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" type="number" required value={prefs.maxBudget} onChange={(e) => setPrefs(prev => ({ ...prev, maxBudget: parseInt(e.target.value) }))} placeholder="Max Budget (₹)" />
            <select className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" value={prefs.fuel} onChange={(e) => setPrefs(prev => ({ ...prev, fuel: e.target.value }))}>{["Any", "Petrol", "Diesel", "Electric", "CNG", "Hybrid"].map(f => <option key={f}>{f}</option>)}</select>
            <select className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" value={prefs.body} onChange={(e) => setPrefs(prev => ({ ...prev, body: e.target.value }))}>{["Any", "SUV", "Sedan", "Hatchback", "MUV", "Crossover"].map(b => <option key={b}>{b}</option>)}</select>
            <select className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" value={prefs.transmission} onChange={(e) => setPrefs(prev => ({ ...prev, transmission: e.target.value }))}>{["Any", "Manual", "Automatic", "CVT", "DCT", "AMT"].map(t => <option key={t}>{t}</option>)}</select>
            <input className="p-2 rounded bg-[#1f2937] text-white border border-gray-600" type="number" min="2" max="9" value={prefs.seating} onChange={(e) => setPrefs(prev => ({ ...prev, seating: parseInt(e.target.value) }))} placeholder="Min Seats" />
          </div>

          <div>
            <label className="block font-medium mb-1">Must-Have Features</label>
            <select multiple className="w-full border border-gray-600 p-2 rounded h-32 bg-[#1f2937] text-white" onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
              setPrefs((prev) => ({ ...prev, features: opts }));
            }}>
              {["Sunroof", "Apple CarPlay/Android Auto", "Automatic Climate Control", "360 Camera", "Lane Assist", "Ventilated Seats", "Wireless Charging"].map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Performance Priority (1-10)</label>
            <input type="range" min="1" max="10" value={prefs.performance} className="w-full" onChange={(e) => setPrefs(prev => ({ ...prev, performance: parseInt(e.target.value) }))} />
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded text-lg">
            {isSearching ? "Finding Cars..." : "Find My Car"}
          </button>

          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-semibold my-6">Top Recommendations</h2>
          {results.map((match, idx) => (
            <div key={idx} className="bg-[#111827] border border-gray-700 p-6 rounded-xl shadow mb-6">
              <h3 className="text-xl font-bold mb-2">{match.car.variant} | {match.car.price}</h3>
              <p className="text-sm">Fuel: {match.car["Fuel Type"]} | Transmission: {match.car["Transmission Type"]} | Seats: {match.car["Seating Capacity"]} | Comfort: {computeComfort(match.car)}/5</p>
              <p className="text-gray-300 text-sm mt-2">{match.car.description}</p>
              <div className="mt-2 text-sm text-green-400">
                {Object.entries(match.details).map(([k, v]) => <p key={k}>• {v}</p>)}
              </div>
            </div>
          ))}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Ask About These Cars</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Your question..." className="flex-1 border border-gray-600 p-2 rounded bg-[#1f2937] text-white" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <button onClick={handleAsk} disabled={isAsking} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                {isAsking ? "Thinking..." : "Ask"}
              </button>
            </div>
            {chatResponse && <div className="mt-4 p-4 bg-[#1f2937] border border-gray-700 rounded text-sm whitespace-pre-wrap">{chatResponse}</div>}
          </div>

          <button className="mt-6 text-red-400 underline" onClick={() => { setHasSearched(false); setResults([]); setChatResponse(""); setError(""); }}>Start New Search</button>
        </>
      )}
    </div>
  );
}
