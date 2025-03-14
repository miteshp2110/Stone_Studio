import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const RichTextEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
          ["bold", "italic", "underline", "strike"], // Basic formatting
          [{ list: "ordered" }, { list: "bullet" }], // Lists
          [], // Blocks
          [], // Subscript/Superscript
          [], // Alignment options
          [], // Remove formatting
        ],
      };
      
  return (
    <div className="quill-editor">
      <ReactQuill  value={value} onChange={onChange} theme="snow"  modules={modules} />
      <style jsx global>{`
        .ql-toolbar {
          background: #f3f3f3;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
