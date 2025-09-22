import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProductsPage = () => {
  return (
    <div className="p-4 border-red-500 rounded-xl">
      <h1 className="text-2xl font-bold ">Products</h1>
      <Button>Click Me</Button>
      <Input placeholder="Enter text" />
    </div>
  );
};

export default ProductsPage;
