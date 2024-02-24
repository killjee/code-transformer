import { Button, Select, MenuItem, Typography, TextField, FormControl, InputLabel } from '@mui/material';
import React from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState("");
  const [tracks, setTracks] = useState([new Track("placeholder", [])]);
  const [selectedTrack, setSelectedTrack] = useState(new Track("placeholder", []));
  const [preparedTrack, setPreparedTrack] = useState(new Track("placeholder", []))
  const [sourceInput, setSourceInput] = useState("")
  const [sourceOutput, setSourceOutput] = useState("Your generated code would appear here")
  const [showError, setShowError] = useState(false)
  const [playButtonDisabled, setPlayButtonDisabled] = useState(false)


  useEffect(() => {
    console.log("Hello world 2")
    fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/languages')
      .then(response => response.json())
      .then(json => {
        console.log(json)
        setLanguages(json)
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    console.log("Hello world 2")
    fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/tracks')
      .then(response => response.json())
      .then(trackJson => {

        console.log(trackJson)
        var _tracks = []

        trackJson.forEach((track, index) => {
          var trackKey = Object.keys(track)[0];
          var trackArgJson = track[trackKey]
          if (typeof track === 'string') {
            trackKey = track
            trackArgJson = {}
          }

          var trackArgs = []
          if (typeof trackArgJson === 'string') {
            trackArgs.push(new TrackArgument(trackArgJson, null))
          } else {
            for (var trackArg in trackArgJson) {
              console.log(trackArg)
              var value = trackArgJson[trackArg]
              if (value == null) {
                value = ""
              }
              trackArgs.push(new TrackArgument(trackArg, value))
            }
          }
          _tracks.push(new Track(trackKey, trackArgs))

        })
        setTracks(_tracks)
      })
      .catch(error => console.error(error));
  }, []);

  const handleLanguageChange = (event) => {
    setSelectedLang(event.target.value);
  };

  const handleTrackChange = (event) => {
    console.log(event.target.value)
    var newPreparedTrack = structuredClone(event.target.value)
    setPreparedTrack(newPreparedTrack)
    setSelectedTrack(event.target.value)
  };

  function handleInputChanged(value) {
    console.log('val:', value);
    setSourceInput(value);
  };

  const handlePlay = async () => {
    var trackArgs = {}
    var track = {}
    console.log(preparedTrack)
    if (preparedTrack.argumentMap.length == 0) {
      track = preparedTrack.key
    } else if (preparedTrack.argumentMap.length == 1 && preparedTrack.argumentMap[0].value == null) {
      track[preparedTrack.key] = preparedTrack.argumentMap[0].key
    } else {
      preparedTrack.argumentMap.forEach((arg) => {
        trackArgs[arg.key] = arg.value
      })
      track[preparedTrack.key] = trackArgs
    }

    var body = JSON.stringify({
      source: sourceInput,
      language: selectedLang,
      track: track
    })
    console.log(sourceInput)
    console.log(track)
    console.log("Satyam " + body)
    setPlayButtonDisabled(true)
    const response = await fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: sourceInput,
        language: selectedLang,
        track: track
      })
    })
    setPlayButtonDisabled(false)
    if (response.ok) {
      setShowError(false)
      var body = await response.json();
      var rewrites = body["rewrites"]

      var code = body["output"]
      console.log(code)
      setSourceOutput(body["output"])

      console.log(body)
    } else {
      setShowError(true)
    }
  }

  const handleArgumentChange = (event) => {
    preparedTrack.argumentMap.forEach((arg) => {
      if (arg.key == event.target.id) {
        var value = structuredClone(event.target.value)
        arg.value = value
      }

      console.log(arg.key + "  " + arg.value + " " + preparedTrack.argumentMap[arg.key])
    })
    setPreparedTrack(preparedTrack)
  }

  const inputCode = "// Write your code here"
  const outputCode = "// Generated code would appear here"
  return (
    <div className="container">
      <div className="selectors">
        <div className="language-selector-div" >
          <FormControl className="language-selector" fullWidth={false} variant='filled' size='small' >
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              id="language-selector"
              value={selectedLang}
              onChange={handleLanguageChange}
            >
              {
                languages.map((language, index) =>
                  <MenuItem value={language}>{language}</MenuItem>
                )
              }
            </Select>
          </FormControl>
        </div>
        <div className="track-selector-div" >
          <FormControl
            className="track-selector" fullWidth={false} variant='filled' size='small' >
            <InputLabel id="track-select-label">Track</InputLabel>
            <Select
              id="track-selector"
              onChange={handleTrackChange}
              value={selectedTrack}
            >
              {
                tracks.map((track, index) =>
                  <MenuItem value={track}>{track.key}</MenuItem>
                )
              }
            </Select>
          </FormControl>

        </div>
      </div >
      <div className="controls">
        {
          selectedTrack.argumentMap.map((argument, index) => {
            return <div className="arguments">
              {
                (argument.value !== null && selectedLang !== "") &&
                < TextField
                  className="argument"
                  id={argument.key}
                  label={argument.key}
                  onChange={handleArgumentChange}
                  variant="standard" />
              }

            </div>
          })
        }
        {
          <div className="play-button">
            {
              (selectedTrack.key !== "placeholder" && selectedLang !== "") &&
              <Button className="play-button" variant="contained" onClick={handlePlay} disabled={playButtonDisabled} >
                Run
              </Button>
            }
          </div>
        }
      </div>
      <div className="code">
        <Card className="code-input" >
          <CodeMirror
            class="input-editor"
            height='80vh'
            value={inputCode}
            onChange={(value, viewUpdate) => {
              handleInputChanged(value)
            }}
            theme="light"
          />
        </Card>
        <Card className="code-output" >{
          showError ?
            <Typography className='error'> Some error, please try running again </Typography> :
            <CodeMirror
              class="input-editor"
              height='80vh'
              editable={false}
              readOnly={true}
              value={sourceOutput}
              theme="light"
            />}
        </Card>
      </div >
    </div >
  );
}

class Track {
  constructor(key, argumentMap) {
    this.key = key
    this.argumentMap = argumentMap
  }
}

class TrackArgument {
  constructor(key, value) {
    this.key = key
    this.value = value
  }
}

export default App;
