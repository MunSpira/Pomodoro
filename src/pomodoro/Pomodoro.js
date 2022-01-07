import { minutesToDuration } from "../utils/duration";
import { secondsToDuration } from "../utils/duration";
import React, { useState } from "react";
import useInterval from "../utils/useInterval";
import PlayPauseStop from "./PlayPauseStop";
import IncrementDecrement from "./IncrementDecrement";
import ProgressBar from "./ProgressBar";

// These functions are defined outside of the component to ensure they do not have access to state
// and are, therefore, more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */

function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);

  return {
    ...prevState,
    timeRemaining,
  };
}
/**
 * Higher-order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  const [session, setSession] = useState(null);
  const [aria, setAria] = useState(0);

  // ToDo: Allow the user to adjust the focus and break duration.
  const [focusDuration, setFocusDuration] = useState(25);
  const handleStopClick = () => {
    setIsTimerRunning(false);
    setSession(null);
  };

  const decrementFocusByFive = () => {
    let newFocusDuration = focusDuration - 5;
    setFocusDuration(newFocusDuration);
    if (newFocusDuration < 5) {
      setFocusDuration(5);
    }
  };
  const incrementFocusByFive = () => {
    let newFocusDuration = focusDuration + 5;
    setFocusDuration(newFocusDuration);
    if (newFocusDuration > 60) {
      setFocusDuration(60);
    }
  };
  const focusDurationInMinutes = minutesToDuration(focusDuration);

  const [breakDuration, setBreakDuration] = useState(5);
  const decrementBreakByOneMinute = () => {
    let newBreakDuration = breakDuration - 1;
    setBreakDuration(newBreakDuration);
    if (newBreakDuration < 1) {
      setBreakDuration(1);
    }
  };
  const incrementBreakByOneMinute = () => {
    let newBreakDuration = breakDuration + 1;
    setBreakDuration(newBreakDuration);
    if (newBreakDuration > 15) {
      setBreakDuration(15);
    }
  };
  const breakDurationInMinutes = minutesToDuration(breakDuration);

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You won't need to make changes to the callback function
   */
  useInterval(
    () => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        setSession(nextSession(focusDuration, breakDuration));
      }
      setSession(nextTick);
      const timeLeft = session.timeRemaining;
      if (session.label === "Focusing") {
        setAria((100 * (focusDuration * 60 - timeLeft)) / (focusDuration * 60));
      } else {
        setAria((100 * (breakDuration * 60 - timeLeft)) / (breakDuration * 60));
      }
    },
    isTimerRunning ? 1000 : null
  );
  /*
  useInterval(() => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );*/

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  return (
    <div className="pomodoro">
      <PlayPauseStop
        handleStopClick={handleStopClick}
        playPause={playPause}
        isTimerRunning={isTimerRunning}
        session={session}
      />

      <IncrementDecrement
        focusDurationInMinutes={focusDurationInMinutes}
        decrementFocusByFive={decrementFocusByFive}
        incrementFocusByFive={incrementFocusByFive}
        breakDurationInMinutes={breakDurationInMinutes}
        incrementBreakByOneMinute={incrementBreakByOneMinute}
        decrementBreakByOneMinute={decrementBreakByOneMinute}
      />

      <ProgressBar
        session={session}
        secondsToDuration={secondsToDuration}
        focusDurationInMinutes={focusDurationInMinutes}
        breakDurationInMinutes={breakDurationInMinutes}
        aria={aria}
      />
    </div>
  );
}

export default Pomodoro;
