/* eslint-disable no-undef, jsx-a11y/accessible-emoji */
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    loading: true
  };

  componentDidMount() {
    this.loadExtensionsList();
  }

  loadExtensionsList = () => {
    chrome.management.getAll(this.setExtensionsList);
  };

  setExtensionsList = extensions => {
    this.setState({ extensions, loading: false });
  };

  iconUrl = icons => {
    if (icons) {
      return [...icons].pop().url;
    }

    return 'build/no-image.png';
  };

  humanReadableHostPermissions = hostPermissions => {
    const permissions = hostPermissions.map(permission => {
      if (
        ['<all_urls>', 'https://*/*', 'http://*/*', '*://*/*'].includes(
          permission
        )
      ) {
        return 'All data on all websites';
      }

      if (permission === 'file:///*' || permission === 'chrome://favicon/*') {
        return 'All local files opened in Chrome';
      }

      const urlMatches = permission.match(/.*\/\*.(.*)\//);
      if (urlMatches) {
        return `All data on ${urlMatches[1]} site and its subdomains`;
      }

      const siteMatches = permission.match(/.*\/(.*)\//);
      if (siteMatches) {
        return `All data on ${siteMatches[1]} site`;
      }

      return permission;
    });

    return [...new Set(permissions)].join(', ');
  };

  renderExtensionsSection = extensions =>
    extensions.map(extension => (
      <article className="bt bb b--black-10">
        <div className="db pv4 ph3 ph0-l no-underline black">
          <div className="flex flex-column flex-row-ns">
            <div className="pr3-ns mb4 mb0-ns w-100 w-30-ns">
              {!extension.enabled && (
                <span className="f7 br3 ph2 pv1 mb2 dib white bg-mid-gray">
                  Disabled
                </span>
              )}
              <img
                src={this.iconUrl(extension.icons)}
                className="db mw4"
                alt={extension.name}
              />
            </div>
            <div className="w-100 w-70-ns pl3-ns">
              <h1 className="f3 fw1 mt0 lh-title">
                <a href={extension.homepageUrl}>{extension.name}</a>
              </h1>
              <p className="f6 f5-l lh-copy">
                {this.humanReadableHostPermissions(extension.hostPermissions)}
              </p>
              <p className="f6 lh-copy mv0">
                <button
                  className="f6 link dim br3 ph3 pv2 mb2 dib white bg-dark-red"
                  onClick={() => this.deleteExtension(extension.id)}
                >
                  Remove from Chrome...
                </button>
              </p>
            </div>
          </div>
        </div>
      </article>
    ));

  deleteExtension = id => {
    chrome.management.uninstall(
      id,
      { showConfirmDialog: true },
      this.loadExtensionsList
    );
  };

  extensionsWithFullAccess = extensions =>
    extensions.filter(e => e.hostPermissions && e.hostPermissions.length > 0);

  render() {
    if (this.state.loading) {
      return 'Loading...';
    }

    const extensionsWithFullAccess = this.extensionsWithFullAccess(
      this.state.extensions
    );

    return (
      <div>
        {extensionsWithFullAccess.length > 0 ? (
          <section className="mw7 center">
            <h2 className="fw1 ph3 ph0-l">
              ⚠️ Warning ⚠️<br />
              You have extensions installed that could be spying on you ({
                extensionsWithFullAccess.length
              }).
            </h2>
            <blockquote className="ml0 mt0 pl4 black-90">
              <p className="f6 lh-copy mt0">
                The following extensions have access to data you see and input
                on websites.<br />
                <b>
                  Please carefully review them and remove ones that you don't
                  trust.
                </b>
              </p>
            </blockquote>
            {this.renderExtensionsSection(extensionsWithFullAccess)}
          </section>
        ) : (
          <section className="mw7 center">
            <h2 className="fw1 ph3 ph0-l">
              All good 👍.<br />
              You don't have extensions installed with full access to your data.
            </h2>
          </section>
        )}
      </div>
    );
  }
}

export default App;
