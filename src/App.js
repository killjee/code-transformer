
import { IconButton, Select, MenuItem, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CodeMirror from "@uiw/react-codemirror";
import './App.css';

// const goLang = `package main
// import "fmt"

// func main() {
//   fmt.Println("Hello, 世界")
// }`;

// function PlayButton() {
//   return <div className="play-button">
//     <IconButton aria-label="delete">
//       <PlayArrowIcon />
//     </IconButton>
//   </div>
// }

// function LanguageSelector() {
//   function handleChange() {

//   }
//   return <div className="langauageSelector">
//     <Select
//       labelId="demo-simple-select-label"
//       id="demo-simple-select"
//       value={10}
//       label="Language"
//       onChange={handleChange}
//       style={{ height: 48, width: 96 }}
//     >
//       <MenuItem value={10}>Ten</MenuItem>
//       <MenuItem value={20}>Twenty</MenuItem>
//       <MenuItem value={30}>Thirty</MenuItem>
//     </Select>
//   </div>
// }

function App() {
  function handleChange() {

  }
  const inputCode = "// Write your code here"
  const outputCode = "// Generated code would appear here"
  return (
    <div className="container">

      <div className="controls">
        <Select
          className="language-selector"
          id="demo-simple-select"
          value={20}
          onChange={handleChange}
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
        <IconButton className="play-button" aria-label="delete" >
          <PlayArrowIcon />
        </IconButton>
      </div>
      <div className="code">
        <Card className="code-input" >
          <CodeMirror
            class="input-editor"
            value={inputCode}
            theme="light"
          />
        </Card>
        <Card className="code-output" >
          <CodeMirror
            class="input-editor"
            editable={false}
            readOnly={true}
            value={outputCode}
            theme="light"
          />
        </Card>
      </div >
    </div>
  );
}

export default App;
