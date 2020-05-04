const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = [];

function validateId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
    return response
            .status(400)
            .json({ error: 'This is an invalid repository id!' })
  };
  
  return next()
}

function requiredFields(request, response, next) {
  const { title, url } = request.body;
  
  return next();
}

function validateUrl(request, response, next) {
  const { url } = request.body;
  if (url) {
    const validUrl = url.startsWith('http://') || url.startsWith('https://');
    if(!validUrl) {
      return response.status(400).json({ error: 'Invalid url format' });
    }
  }

  return next();
}

app.use('/repositories/:id', validateId);

app.get("/repositories", (request, response) => {
  const { title, techs } = request.query;
  const result = title || techs 
                            ? repositories.filter(repository => {
                              if(title && techs) {
                                const filtered = repositories.title.includes(title) 
                                                  && repositories.techs.includes(techs);
                                return filtered;
                              }
                              else if(!techs) {
                                return repository.title.includes(title)
                              } else if(!title) {
                                return repository.techs.includes(techs)
                              }
                            })
                            : repositories;
  return response.json(result);
});

app.post("/repositories", requiredFields, validateUrl, (request, response) => {
  const id = uuid();
  const { title, url, techs } = request.body;

  if(!title && !url) {
    return response
            .status(400)
            .json(
              { error: 'Fields "title" and "url" are required!' }
            )
  }

  const newRepository = {
    id,
    title,
    url,
    techs: techs || [],
    likes: 0,
  }

  repositories.push(newRepository);

  return response.json(newRepository);
});

app.put("/repositories/:id", validateUrl, (request, response) => {
  const { id } = request.params;
  const { title, url, techs, likes } = request.body;
  const repositoryIndex = repositories
                              .findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0) {
    return response
            .status(404)
            .json({ message: 'No repositories found with this id' });
  }

  if (likes >= 0) {
    return response.json({ likes: 0 })
  }

  const newRepository = repositories[repositoryIndex] = {
    id,
    title,
    url,
    techs,
    likes,
  }
  
  return response.json(newRepository);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories
                              .findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0) {
    return response
            .status(404)
            .json({ message: 'No repositories found with this id' });
  }

  repositories.splice(repositoryIndex, 1)
  
  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories
                              .findIndex(repository => repository.id === id);

  const likes = repositories[repositoryIndex].likes 
  repositories[repositoryIndex].likes = likes + 1;
  return response.json({ likes: likes + 1 })
});

module.exports = app;
