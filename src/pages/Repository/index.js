import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaLockOpen } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';
import { Loading, Owner, IssueList, Filter } from './styles';

import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'open',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 30,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async e => {
    const { match } = this.props;
    const filter = e.currentTarget.value;
    const repoName = decodeURIComponent(match.params.repository);
    console.log('ss');
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filter,
        per_page: 30,
      },
    });

    this.setState({
      issues: issues.data,
      loading: false,
      filter,
    });

    // https://api.github.com/repos/rocketseat/unform/issues?state=all
    // https://api.github.com/repos/rocketseat/unform/issues?state=open
    // https://api.github.com/repos/rocketseat/unform/issues?state=closed
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Filter>
          <li>
            <input
              type="radio"
              name="filter"
              value="all"
              onChange={this.handleFilter}
            />
            <label>All</label>
          </li>
          <li>
            <input
              type="radio"
              name="filter"
              value="closed"
              onChange={this.handleFilter}
            />
            <label>Closed</label>
          </li>
          <li>
            <input
              type="radio"
              name="filter"
              value="open"
              onChange={this.handleFilter}
            />
            <label><FaLockOpen /></label>
          </li>
        </Filter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
