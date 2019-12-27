import React, {Component} from 'react';
import Navigation from './components/Navigation'
import Form from './components/form/Form'
import Signin from './components/signin/Signin'
import Profile from './components/Profile'
import Register from './components/register/Register'
import './App.css';
import Clarifai from 'clarifai'
import FaceRecognition from './components/faceRecognition/FaceRecognition'


// https://samples.clarifai.com/celebrity.jpeg

const app = new Clarifai.App({
  apiKey: '378b861234f8416793e39b54bb6d171c'
 });

class App extends Component {

  state = {
    input:'',
    imageUrl:undefined,
    celebrityName:'',
    percentage:'',
    route:'signin',
    isSignedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      entries:0,
      joined:''
    }
  }

  loadUser = (data) => {
    this.setState({user:{
        id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
      }
    })
  }

  showResult = (response) => {
    this.setState({celebrityName:response.outputs[0].data.regions[0].data.concepts[0].name})
    const percentage = (response.outputs[0].data.regions[0].data.concepts[0].value)*100
   this.setState({percentage})
  }

  onInputChange = (e) => {
    this.setState({input:e.target.value})
  }

  onButtonSubmit = () => {
    if(this.state.input)
    this.setState({imageUrl: this.state.input})
    app.models.
      predict(
        Clarifai.CELEBRITY_MODEL, 
        this.state.input)
      .then(response => {
        if(response){
          fetch('http://localhost:3000/image',{
            method:'put',
            headers: {'content-Type':'application/json'},
            body:JSON.stringify({
              id:this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
        }
        this.showResult(response)
      })
        
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    }else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route})
  }
    

  render() {
    const { isSignedIn, imageUrl, celebrityName, percentage, route } = this.state;
    return (
      <div className="App">
       <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route==='home' ? 
          <>
             <Profile name = {this.state.user.name} entries ={this.state.user.entries}/>
             <Form onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
             {imageUrl === undefined ? 
              ''
              :<FaceRecognition imageUrl={imageUrl} celebrityName={celebrityName} percentage={percentage}/>}
          </>
          : (
            this.state.route === 'signin'
              ?<Signin 
                onRouteChange={this.onRouteChange}
                loadUser = {this.loadUser}
               /> 
              :<Register 
                  onRouteChange={this.onRouteChange}
                  loadUser = {this.loadUser}
                /> 
          )
        }
      </div>
    );
  }
}

export default App;
