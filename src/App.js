import { Button, Select, MenuItem, Typography, TextField, FormControl, InputLabel } from '@mui/material';
import React from 'react';
import Card from '@mui/material/Card';
import { Editor, DiffEditor } from "@monaco-editor/react";
import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { diff } from 'react-ace';

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
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showReplayModal, setShowReplayModal] = useState(false)
  const [editor, setEditor] = useState()
  const [totalUndoChanges, setTotalUndoChanges] = useState(0)
  const [rewriteStates, setRewriteStates] = useState([])
  const [diffableOutput, setDiffableOutput] = useState("")


  useEffect(() => {
    fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/languages')
      .then(response => response.json())
      .then(json => {

        setLanguages(json)
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/tracks')
      .then(response => response.json())
      .then(trackJson => {


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
    var newPreparedTrack = structuredClone(event.target.value)
    setPreparedTrack(newPreparedTrack)
    setSelectedTrack(event.target.value)
  };

  const handleReplay = () => {
    var rewriteIndex = totalUndoChanges
    var tempCode = diffableOutput
    if (totalUndoChanges == 0) {
      tempCode = sourceInput
    }
    console.log(rewriteStates)
    var startIndex = rewriteStates[rewriteIndex]["edit"]["start_byte"]
    console.log(startIndex)
    var endIndex = rewriteStates[rewriteIndex]["edit"]["old_end_byte"]
    var firstPart = ""
    if (startIndex > 0) {
      firstPart = tempCode.substring(0, startIndex)
    }
    var secondPart = rewriteStates[rewriteIndex]["replacement"]
    var thirdPart = ""
    if (endIndex < tempCode.length) {
      thirdPart = tempCode.substring(endIndex)
    }
    console.log(tempCode)
    console.log(tempCode.length)
    console.log(firstPart)
    console.log(secondPart)
    console.log(thirdPart)

    setDiffableOutput(firstPart + secondPart + thirdPart)
    setTotalUndoChanges(totalUndoChanges + 1)
  }

  function handleInputChanged(value) {
    setSourceInput(value);
  };

  const handlePlayButtonTap = async () => {
    var trackArgs = {}
    var track = {}
    if (preparedTrack.argumentMap.length === 0) {
      track = preparedTrack.key
    } else if (preparedTrack.argumentMap.length === 1 && preparedTrack.argumentMap[0].value == null) {
      track[preparedTrack.key] = preparedTrack.argumentMap[0].key
    } else {
      preparedTrack.argumentMap.forEach((arg) => {
        trackArgs[arg.key] = arg.value
      })
      track[preparedTrack.key] = trackArgs
    }

    var requestBody = JSON.stringify({
      source: sourceInput,
      language: selectedLang,
      track: track
    })

    setPlayButtonDisabled(true)
    const response = await fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    })
    setPlayButtonDisabled(false)
    setCodeGenerated(true)

    if (response.ok) {
      setShowError(false)
      var responseBody = await response.json();

      setSourceOutput(responseBody["output"])
      setRewriteStates(responseBody["rewrites"])
      console.log(responseBody["rewrites"])
      highlightRewrites(responseBody["rewrites"])
    } else {
      setShowError(true)
    }
  }

  const handleDiffButtonTap = () => {
    setDiffableOutput(sourceOutput)
    setShowModal(true)
  }

  const handleReplayButtonTap = () => {
    setDiffableOutput(sourceInput)
    setShowReplayModal(true)
  }

  const handleArgumentChange = (event) => {
    preparedTrack.argumentMap.forEach((arg) => {
      if (arg.key === event.target.id) {
        var value = structuredClone(event.target.value)
        arg.value = value
      }
    })
    setPreparedTrack(preparedTrack)
  }

  function handleEditorSetup(editor) {
    editor.updateOptions({
      readOnly: true, minimap: {
        enabled: false
      }
    })
    setEditor(editor)
  }


  function highlightRewrites(rewrites) {
    var decorations = []
    rewrites.forEach((value, index) => {
      var startRow = structuredClone(value["edit"]["start_position"]["row"])
      var startColumn = structuredClone(value["edit"]["start_position"]["row"])
      var endRow = structuredClone(value["edit"]["new_end_position"]["row"])
      var endColumn = structuredClone(value["edit"]["new_end_position"]["row"])
      var range = {
        startLineNumber: startRow,
        startColumn: startColumn,
        endLineNumber: endRow,
        endColumn: endColumn,
      }
      var decoration = {
        range: range,
        options: {
          className: "inline_decoration",
          hoverMessage: "Code refactored",
          isWholeLine: true,
        }
      }
      if (decorations.length < 1) {
        decorations.push(decoration)
      }
    })
    var dec = editor.createDecorationsCollection(decorations)
  }

  var editorOptions = {
    scrollbars: { visible: false },
    minimap: {
      enabled: false
    }
  }
  var readOnlyEditorOptions = {
    readOnly: true,
    scrollbars: { visible: false },
    minimap: {
      enabled: false
    }
  }
  return (
    <>
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
                <Button className="play-button" variant="contained" onClick={handlePlayButtonTap} disabled={playButtonDisabled} >
                  Run
                </Button>
              }
            </div>
          }
          {
            <div className="diff-button">
              {
                (codeGenerated === true) &&
                <Button className="diff-button" variant="contained" onClick={handleDiffButtonTap} disabled={playButtonDisabled} >
                  Diff
                </Button>
              }
            </div>
          }
          {
            <div className="replay-button">
              {
                (codeGenerated === true) &&
                <Button className="replay-button" variant="contained" onClick={handleReplayButtonTap} disabled={playButtonDisabled} >
                  Replay
                </Button>
              }
            </div>
          }
        </div>
        <div className="code">
          <Card className="code-input" >
            <Editor
              class="input-editor"
              height="85vh"
              value={sourceInput}
              theme='light'
              options={editorOptions}
              defaultValue="// Write your code here"
              onChange={(value, viewUpdate) => {
                handleInputChanged(value)
              }}
            />
          </Card>
          <Card className="code-output" >
            {
              showError ?
                <Typography className='error'> Some error, please try running again </Typography> :
                <Editor
                  class="input-editor"
                  height="85vh"
                  options={readOnlyEditorOptions}
                  value={sourceOutput}
                  theme='light'
                  defaultValue="// Write your code here"
                  onMount={(editor, monaco) => {
                    handleEditorSetup(editor)
                  }}
                />
            }
          </Card>
        </div >
      </div >
      <Modal show={showReplayModal} fullscreen={true} onHide={() => {
        setShowReplayModal(false)
        setTotalUndoChanges(0)
      }}>
        <Modal.Header closeButton>
          <Button
            className="play-button"
            variant="contained"
            onClick={handleReplay}
            disabled={totalUndoChanges === rewriteStates.length}>
            {
              totalUndoChanges !== rewriteStates.length ?
                "Replay change number: " + (totalUndoChanges + 1) + " out of " + rewriteStates.length + "changes" :
                "Replay complete"
            }
          </Button>
        </Modal.Header>
        <Modal.Body>
          <DiffEditor
            options={readOnlyEditorOptions}
            original={sourceInput}
            modified={diffableOutput}
          />
        </Modal.Body>
      </Modal >
      <Modal show={showModal} fullscreen={true} onHide={() => {
        setShowModal(false)
        setTotalUndoChanges(0)
      }}>
        <Modal.Header closeButton>
          Diff
        </Modal.Header>
        <Modal.Body>
          <DiffEditor
            options={readOnlyEditorOptions}
            original={sourceInput}
            modified={diffableOutput}
          />
        </Modal.Body>
      </Modal >
    </>

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
