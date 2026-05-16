import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";

export default function Home() {

  return (
    <div className="flex bg-black min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-8">

          <h1 className="text-4xl font-bold text-white mb-8">
            Dashboard
          </h1>

          <div className="grid md:grid-cols-3 gap-6">

            <Card
              title="Users"
              value="120"
              color="bg-blue-950"
            />

            <Card
              title="Tenders"
              value="34"
              color="bg-green-950"
            />

            <Card
              title="Police Requests"
              value="19"
              color="bg-red-950"
            />

          </div>

        </div>

      </div>

    </div>
  );
}