import { Button, TextField } from '@mui/material';
import './App.css';

export function Controls({ selectedTrack, handleArgumentChange, selectedLang,
    handlePlayButtonTap, playButtonDisabled, codeGenerated, handleDiffButtonTap,
    handleReplayButtonTap }) {
    return <>
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
                    <Button
                        className="play-button"
                        variant="contained"
                        onClick={handlePlayButtonTap}
                        disabled={playButtonDisabled} >
                        Run
                    </Button>
                }
            </div>
        }
        {
            <div className="diff-button">
                {
                    (codeGenerated === true) &&
                    <Button
                        className="diff-button"
                        variant="contained"
                        onClick={handleDiffButtonTap} >
                        Diff
                    </Button>
                }
            </div>
        }
        {
            <div className="replay-button">
                {
                    (codeGenerated === true) &&
                    <Button
                        className="replay-button"
                        variant="contained"
                        onClick={handleReplayButtonTap}>
                        Replay
                    </Button>
                }
            </div>
        }
    </>
}