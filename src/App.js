import { Button, Typography } from '@mui/material';
import React from 'react';
import Card from '@mui/material/Card';
import { Editor, DiffEditor } from "@monaco-editor/react";
import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Selectors } from './selector';
import { Controls } from './controls';
import { Track, TrackArgument } from './track';
import { CallGetLanguages, CallGetTracks, CallPlay } from './network';

function App() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState({});
  const [tracks, setTracks] = useState([new Track("placeholder", [])]);
  const [selectedTrack, setSelectedTrack] = useState(new Track("placeholder", []));
  const [preparedTrack, setPreparedTrack] = useState(new Track("placeholder", []))
  const [sourceInput, setSourceInput] = useState("")
  const [sourceOutput, setSourceOutput] = useState("Your generated code would appear here")
  const [showError, setShowError] = useState(false)
  const [playButtonDisabled, setPlayButtonDisabled] = useState(false)
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [showReplayModal, setShowReplayModal] = useState(false)
  const [changesReplayed, setChangesReplayed] = useState(0)
  const [rewriteStates, setRewriteStates] = useState([])
  const [diffableOutput, setDiffableOutput] = useState("")

  // - MARK: Hooks
  useEffect(() => {
    CallGetLanguages()
      .then(response => response.json())
      .then(json => {

        setLanguages(json)
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    CallGetTracks()
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

  // - MARK: Handle ui events
  const handleLanguageChange = (event) => {
    setSelectedLang(event.target.value);
  };

  const handleTrackChange = (event) => {
    var newPreparedTrack = structuredClone(event.target.value)
    setPreparedTrack(newPreparedTrack)
    setSelectedTrack(event.target.value)
  };

  // Logic to embed changes 1 by 1 and present to UI
  const handleReplay = () => {
    var rewriteIndex = changesReplayed
    var tempCode = diffableOutput
    if (changesReplayed === 0) {
      tempCode = sourceInput
    }

    var startIndex = rewriteStates[rewriteIndex]["edit"]["start_byte"]
    var endIndex = rewriteStates[rewriteIndex]["edit"]["old_end_byte"]

    // Part before change
    var firstPart = ""
    if (startIndex > 0) {
      firstPart = tempCode.substring(0, startIndex)
    }
    // Change
    var secondPart = rewriteStates[rewriteIndex]["replacement"]

    // Part after change
    var thirdPart = ""
    if (endIndex < tempCode.length) {
      thirdPart = tempCode.substring(endIndex)
    }

    setDiffableOutput(firstPart + secondPart + thirdPart)
    setChangesReplayed(changesReplayed + 1)
  }

  // Code input changed
  function handleInputChanged(value) {
    setSourceInput(value);
  };

  const handlePlayButtonTap = async () => {
    setPlayButtonDisabled(true)
    const response = await CallPlay(preparedTrack, sourceInput, selectedLang)
    setPlayButtonDisabled(false)
    setCodeGenerated(true)

    if (response.ok) {
      setShowError(false)
      var responseBody = await response.json();

      setSourceOutput(responseBody["output"])
      setRewriteStates(responseBody["rewrites"])
    } else {
      setShowError(true)
    }
  }

  const handleDiffButtonTap = () => {
    setDiffableOutput(sourceOutput)
    setShowDiffModal(true)
  }

  const handleReplayButtonTap = () => {
    setDiffableOutput(sourceInput)
    setShowReplayModal(true)
  }

  // Handles change in value of arguments for tracks
  const handleArgumentChange = (event) => {
    preparedTrack.argumentMap.forEach((arg) => {
      if (arg.key === event.target.id) {
        var value = structuredClone(event.target.value)
        arg.value = value
      }
    })
    setPreparedTrack(preparedTrack)
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
          <Selectors
            selectedLang={selectedLang}
            selectedTrack={selectedTrack}
            handleLanguageChange={handleLanguageChange}
            handleTrackChange={handleTrackChange}
            languages={languages}
            tracks={tracks}
          />
        </div >
        <div className="controls">
          <Controls
            selectedTrack={selectedTrack}
            handleArgumentChange={handleArgumentChange}
            selectedLang={selectedLang}
            handlePlayButtonTap={handlePlayButtonTap}
            playButtonDisabled={playButtonDisabled}
            codeGenerated={codeGenerated}
            handleDiffButtonTap={handleDiffButtonTap}
            handleReplayButtonTap={handleReplayButtonTap} />
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
                />
            }
          </Card>
        </div >
      </div >
      <Modal show={showReplayModal} fullscreen={true} onHide={() => {
        setShowReplayModal(false)
        setChangesReplayed(0)
      }}>
        <Modal.Header closeButton>
          <Button
            className="play-button"
            variant="contained"
            onClick={handleReplay}
            disabled={changesReplayed === rewriteStates.length}>
            {
              changesReplayed !== rewriteStates.length ?
                "Replay change number: " + (changesReplayed + 1) + " out of " + rewriteStates.length + " changes" :
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
      <Modal show={showDiffModal} fullscreen={true} onHide={() => {
        setShowDiffModal(false)
        setChangesReplayed(0)
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

export default App;
