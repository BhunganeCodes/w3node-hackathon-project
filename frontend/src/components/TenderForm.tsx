import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function TenderForm() {
  const [form, setForm] = useState({
    title: "",
    reference: "",
    department: "",
    budget: "",
    closingDate: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tender submitted:", form);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="tender-form-container"
    >
      <Card className="tender-card">
        <CardContent>
          <h2 className="tender-title">Create New Tender</h2>

          <form onSubmit={handleSubmit} className="tender-form">
            <input
              name="title"
              placeholder="Tender Title"
              value={form.title}
              onChange={handleChange}
              className="tender-input"
            />

            <input
              name="reference"
              placeholder="Tender Reference Number"
              value={form.reference}
              onChange={handleChange}
              className="tender-input"
            />

            <input
              name="department"
              placeholder="Issuing Department"
              value={form.department}
              onChange={handleChange}
              className="tender-input"
            />

            <input
              name="budget"
              type="number"
              placeholder="Estimated Budget (ZAR)"
              value={form.budget}
              onChange={handleChange}
              className="tender-input"
            />

            <input
              name="closingDate"
              type="date"
              value={form.closingDate}
              onChange={handleChange}
              className="tender-input"
            />

            <textarea
              name="description"
              placeholder="Tender Description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="tender-textarea"
            />

            <Button type="submit" className="tender-submit">
              Publish Tender
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
