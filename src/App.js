import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
import particleStyle from './particlesjs-config.json'
import 'tachyons';

const particlesOptions = particleStyle;

const initialState = {
  input: '',
  imageUrl: '',
  faceBox: [],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
 }  
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocations = (data) => {
    // const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    // const image = document.getElementById('inputimage');
    // const width = Number(image.width);
    // const height = Number(image.height);

    // return {
    //   leftCol: clarifaiFace.left_col * width,
    //   topRow: clarifaiFace.top_row * height,
    //   rightCol: width - (clarifaiFace.right_col * width),
    //   bottomRow: height - (clarifaiFace.bottom_row * height)
    // }

    let res = [];
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    
    for (let reg of data.outputs[0].data.regions) {
      res.push({
        topRow: reg.region_info.bounding_box.top_row * height,        
        rightCol: width - (reg.region_info.bounding_box.right_col * width),
        bottomRow: height - (reg.region_info.bounding_box.bottom_row * height),
        leftCol: reg.region_info.bounding_box.left_col * width          
      });
    }      
    return res;
    }

  displayFaceBox = (box) => {
    this.setState({faceBox: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://arcane-wave-46340.herokuapp.com/imageurl', {
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          input: this.state.input
          })
    })
    .then(response => response.json())   
    .then(response => {
      if(response){
        fetch('https://arcane-wave-46340.herokuapp.com/image', {
        method: "put",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocations(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState);
    } else if(route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, faceBox, route} = this.state;
    return(
      <div className='App'>
        <Particles className='particles'
          params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === 'home' 
          ? <div>
              <Logo />         
              <Rank 
              name={this.state.user.name}
              entries={this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onPictureSubmit={this.onPictureSubmit}
              />
              <FaceRecognition box={faceBox} imageUrl={imageUrl}/>
            </div>
          : ( 
              route === 'signin' 
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
            )
        }
      </div>
    );
  }
}

export default App;
