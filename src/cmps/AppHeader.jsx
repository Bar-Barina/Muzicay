import { getSpotifySvg } from '../services/SVG.service'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { UserModal } from './Modals/UserModal'
import { useState, useEffect } from 'react'
import { setCurrSong, setCurrSongIndex } from '../store/actions/song.actions'
import { doLogout } from '../store/actions/user.actions'
import { useDispatch, useSelector } from 'react-redux'
import { eventBus } from '../services/event-bus.service'
export function AppHeader() {
  const [showModal, setShowModal] = useState(false)
  const [currScrollPos, setScrollPos] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const navigate = useNavigate()

  const station = useSelector(
    (storeState) => storeState.stationModule.currStation
  )
  const user = useSelector((storeState) => storeState.userModule.loggedInUser)
  const dispatch = useDispatch()
  const location = useLocation()

  const [headers, setHeaders] = useState({
    backgroundColor: 'transparent',
  })

  function updateHeaderOpacity(scrollPos, headerBg) {
    setScrollPos(scrollPos)
    const maxScroll = 50
    let opacity = Math.min(scrollPos / maxScroll, 1)

    let match = headerBg?.background?.match(/rgb\((\d+,\d+,\d+)\)/)
    let dominantColor = match ? match[1] : '0,0,0'

    const newHeaders = {
      backgroundColor: `rgba(${dominantColor}, ${opacity})`,
    }
    setHeaders(newHeaders)
  }

  function playFirstSong() {
    dispatch(setCurrSong(station?._id, station?.songs[0]._id))
    dispatch(setCurrSongIndex(station?._id, station?.songs[0]._id))
  }

  function handleLogout() {
    dispatch(doLogout())
  }

  useEffect(() => {
    const onScroll = ({ scrollPos, headerBg }) => {
      updateHeaderOpacity(scrollPos, headerBg)
    }
    const unlistenIndex = eventBus.on('stationIndexScroll', onScroll)
    if (
      location.pathname === '/' ||
      location.pathname === '/search' ||
      location.pathname === '/lyrics'
    ) {
      console.log('new header')
      setHeaders({
        backgroundColor: 'rgba(0,0,0,0)',
      })
      console.log('headers', headers)
    } else {
      setHeaders({
        backgroundColor: 'transparent',
      })
    }
    return () => {
      unlistenIndex()
    }
  }, [location.pathname])
  useEffect(() => {
    const onScroll = ({ scrollPos, bgStyle }) => {
      updateHeaderOpacity(scrollPos, bgStyle)
    }
    const unlistenDetails = eventBus.on('stationDetailsScroll', onScroll)

    if (
      location.pathname === '/' ||
      location.pathname === '/search' ||
      location.pathname === '/lyrics'
    ) {
      console.log('new header')
      setHeaders({
        backgroundColor: 'rgba(0,0,0,0)',
      })
      console.log('headers', headers)
    } else {
      console.log('transparent')
      setHeaders({
        backgroundColor: 'transparent',
      })
    }
    return () => {
      unlistenDetails()
    }
  }, [location.pathname])

  function onShowModal() {
    setShowModal(true)
  }

  function onCloseModal() {
    setShowModal(false)
  }

  function playFirstSongInStation(event) {
    event.stopPropagation()
    dispatch(setCurrSong(station?._id, station?.songs[0]._id))
    dispatch(setCurrSongIndex(station?._id, station?.songs[0]._id))
    setIsPlaying(!isPlaying)
  }

  function goToPreviousRoute() {
    navigate(-1)
  }

  function goToNextRoute() {
    navigate(+1)
  }

  return (
    <header className="app-header" style={{ ...headers }}>
      <section className="arrows-and-input">
        <section className="arrows">
          <div className="black-circle">
            <span
              onClick={goToPreviousRoute}
              className="title"
              title="Go back"
              dangerouslySetInnerHTML={{
                __html: getSpotifySvg('leftArrowIcon'),
              }}
            ></span>
          </div>
          <div className="black-circle">
            <span
              onClick={goToNextRoute}
              className="title"
              title="Go forward"
              dangerouslySetInnerHTML={{
                __html: getSpotifySvg('rightArrowIcon'),
              }}
            ></span>
          </div>
        </section>
        {location.pathname === '/search' && (
          <div className="flex align-center justify-center input-container">
            <span
              dangerouslySetInnerHTML={{
                __html: getSpotifySvg('smallerSearchIcon'),
              }}
            ></span>
            <input placeholder="What do you want to listen to?" />
          </div>
        )}

        {currScrollPos > 300 &&
        location.pathname === `/station/${station?._id}` ? (
          <div
            onClick={playFirstSong}
            className="flex align-center justify-center station-options"
          >
            <div
              className="play-button flex justify-center"
              onClick={playFirstSongInStation}
            >
              {isPlaying ? (
                <span
                  title="Pause"
                  className="pause-button flex align-center justify-center title"
                  dangerouslySetInnerHTML={{
                    __html: getSpotifySvg('biggerPauseBtn'),
                  }}
                ></span>
              ) : (
                <span
                  title="Play"
                  className=" flex align-center justify-center title"
                  dangerouslySetInnerHTML={{
                    __html: getSpotifySvg('biggerPlayBtn'),
                  }}
                ></span>
              )}
            </div>
            <p className="">{station.name}</p>
          </div>
        ) : (
          ''
        )}
      </section>

      <div className="user-actions flex justify-center align-center">
        {!user ? (
          <>
            <Link to="/signup">
              <button className="sign-up pointer">Sign up</button>
            </Link>
            <Link to="/login">
              <button className="login pointer flex justify-center align-center">
                Log in
              </button>
            </Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout} className="sign-up  pointer">
              Log out
            </button>
            <Link to="/user">
              <span className="user-details-header">
                <img
                title={user?.username}
                  src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                  alt="user-img"
                />
              </span>
            </Link>
          </>
        )}
      </div>
      {showModal && <UserModal onClose={onCloseModal} />}
    </header>
  )
}
// import React, { useState } from "react";
// import { useEffect } from "react";

// export function useOnScreen (options) {
//     //part 1
//     const [ref,setRef] = useState(null)
//     const [visible,setVisible] = useState(false)
// //part2
//     useEffect(() => {
//     const observer = new IntersectionObserver(([entry])=>{
//         setVisible(entry.isIntersecting)
//     },options)
//     if(ref){
//         observer.observe(ref)
//     }

//       return () => {
//        if(ref){
//         observer.unobserve(ref)
//        }
//       }
//     }, [ref,visible])
// //part3
// return [setRef,visible]

// }
