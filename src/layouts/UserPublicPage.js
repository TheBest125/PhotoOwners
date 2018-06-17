import React, { Component } from "react";
import { Header } from "semantic-ui-react";
import { fetchUserPublicPhotos } from "../actions/publicActions";
import { connect } from "react-redux";
import { PhotoListView } from "./ReusablePhotoListView";
import _ from "lodash";
import moment from "moment";
import { TopMenuPublic, SideMenuNarrowPublic } from "./menubars";

var TOP_MENU_HEIGHT = 45; // don't change this
var LEFT_MENU_WIDTH = 85; // don't change this


export class UserPublicPage extends Component {
  state = {
    photosGroupedByDate: [],
    idx2hash: [],
    username: null
  };

  componentDidMount() {
    this.props.dispatch(
      fetchUserPublicPhotos(this.props.match.params.username)
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.pub.userPublicPhotos.hasOwnProperty(
        nextProps.match.params.username
      )
    ) {
      const photos =
        nextProps.pub.userPublicPhotos[nextProps.match.params.username];
      if (prevState.idx2hash.length != photos.length) {
        var t0 = performance.now();
        var groupedByDate = _.groupBy(photos, el => {
          if (el.exif_timestamp) {
            return moment(el.exif_timestamp).format("YYYY-MM-DD");
          } else {
            return "No Timestamp";
          }
        });
        var groupedByDateList = _.reverse(
          _.sortBy(
            _.toPairsIn(groupedByDate).map(el => {
              return { date: el[0], photos: el[1] };
            }),
            el => el.date
          )
        );
        var idx2hash = [];
        console.log(groupedByDateList);
        groupedByDateList.forEach(g => {
          g.photos.forEach(p => {
            idx2hash.push(p.image_hash);
          });
        });
        var t1 = performance.now();
        console.log(t1 - t0);
        return {
          ...prevState,
          photosGroupedByDate: groupedByDateList,
          idx2hash: idx2hash,
          username: nextProps.match.params.username
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  render() {
    const { fetchingAlbumsUser } = this.props;
    return (
      <div>
        { this.props.ui.showSidebar && <SideMenuNarrowPublic />}
        <TopMenuPublic />
        <div style={{paddingTop:TOP_MENU_HEIGHT, paddingLeft: this.props.ui.showSidebar ? LEFT_MENU_WIDTH + 5 : 5}}>
        <PhotoListView
          title={"Public photos of " + this.props.match.params.username}
          loading={this.props.pub.fetchingUserPublicPhotos}
          titleIconName={"globe"}
          photosGroupedByDate={this.state.photosGroupedByDate}
          idx2hash={this.state.idx2hash}
          isPublic={true}
        />
        </div>
      </div>
    );
  }
}
UserPublicPage = connect(store => {
  return {
    pub: store.pub,
    ui: store.ui,
  };
})(UserPublicPage);
