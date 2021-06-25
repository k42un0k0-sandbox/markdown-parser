import { useEffect, useState } from "preact/hooks";
import { remark } from "./remark";
import { markdownIt } from "./markdown-it";
import { marked } from "./marked";
// @ts-ignore
import sample from "./sample.md";

const map = {
  "0": marked,
  "1": markdownIt,
  "2": remark,
};

type Keys = "0" | "1" | "2";

function App() {
  const [index, setIndex] = useState<Keys>("0");
  const [md, setMD] = useState("");
  useEffect(() => {
    (async () => {
      const res = await map[index](sample);
      setMD(res);
    })();
  }, [index]);
  return (
    <div>
      <select
        value={index}
        onChange={(e) => {
          //@ts-ignore
          setIndex(e.target.value);
        }}
      >
        <option value="0">marked</option>
        <option value="1">markdown-it</option>
        <option value="2">remark</option>
      </select>
      <h2>result</h2>
      <article dangerouslySetInnerHTML={{ __html: md }} />
    </div>
  );
}

export default App;
