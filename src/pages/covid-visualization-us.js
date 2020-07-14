/// app.js
import React, {useState, useEffect} from 'react';
//import {View as ReactView} from "react-native";
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import Layout from "../components/layout"
import StateService from '../covid-project-service/covid-data.js'
import { graphql } from 'gatsby'

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidmFwdXRyYSIsImEiOiJja2JvZHA5OG4wZGI1MzFqeXRzMW16NTlhIn0.Szwbtj4JFOFkecPa8OnQyA';

// Initial viewport settings
const initialViewState = {
  longitude: -80.793457,
  latitude: 35.782169,
  zoom: 7,
  pitch: 0,
  bearing: 0
};


// Data to be used by the LineLayer
const App = ({data}) => {
    const statesCoordinate = data.allStatesCoordinatesCsv.edges
    //Data collection
    const [statesData, setStatesData] = useState([])
    useEffect(() => {
        StateService
          .getAll()
          .then(allStates => {
            setStatesData(allStates)
          })
      }, [])
    console.log('render', statesData.length, 'States COVID-19 Current Data')
    console.log('States Data: ',statesData)
    console.log('States Coordinates: ', statesCoordinate)
    
    var data = []
    if(statesData) {
      
      statesCoordinate.forEach(state => {
        const currentStateCovid = statesData.filter(individualState => individualState.state.localeCompare(state.node.State) === 0)
        if(currentStateCovid[0]) {
            //console.log(currentStateCovid[0].positive)
            const newState = {
                state: currentStateCovid[0].state,
                positive: currentStateCovid[0].positive,
                coordinates: [Number(state.node.Longitude), Number(state.node.Latitude)]
            }
            data = data.concat(newState)
        }
        
    })
    }
    
    console.log('Processed Data: ', data)
    // Deck.GL and MapBox rendering
    // const layers = [
    //   new LineLayer({id: 'line-layer', data})
    // ];
    const layer = new ScatterplotLayer({
        id: 'scatterplot-layer',
        data,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 1,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        getPosition: d => d.coordinates,
        getRadius: d => d.positive / 5,
        getFillColor: d => [255, 140, 0],
        getLineColor: d => [0, 0, 0]
      });

    return (
        <Layout location={''} title={"COVID-19 Visualization"}>
            <div style={{position: 'relative', top: 100, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                <DeckGL
                    height={700}
                    initialViewState={initialViewState}
                    controller={true}
                    layers={[layer]}
                    getTooltip={({object}) => object && `Positive test in ${object.state}: ${object.positive} cases`}
                >
                    <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
                </DeckGL>
            </div>
        </Layout>
    )
}

export default App;

export const pageQuery = graphql`
query MyQuery {
    allStatesCoordinatesCsv {
      edges {
        node {
          State
          Longitude
          Latitude
          id
        }
      }
    }
  }  
`
