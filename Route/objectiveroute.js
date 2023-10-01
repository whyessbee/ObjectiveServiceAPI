import express from 'express'; // Importing Express.js
import Objective from '../model/objectives.js'; // Importing the objectives model
import ObjectiveUser from '../model/auth.js'; // Importing the authentication model
import { setCache, getCache } from '../cache/operations.js'; // Importing cache operations
import moment from 'moment'; // Importing Moment.js for date manipulation
import verifyToken from '../middlewares/verifyuser.js'; // Importing middleware for token verification

const route = express.Router(); // Creating an instance of Express router

// Endpoint to create an objective
route.post('/createobjective', verifyToken, async (req, res, next) => {
  try {
    const obUser = await ObjectiveUser.findOne({ Email: req.body.AssignedTo });

    if (!obUser || obUser.Role !== 'Developer' || req.Role !== 'Developer') {
      res.status(400).send({ Message: 'You are not allowed to create an objective.' });
      return;
    }

    const input = { ...req.body, Creator: req.Email };
    input['Audit'] = {
      ChangeValue: req.body.TargetValue,
      UpdatedBy: req.Email,
      UpdatedOn: '',
      CreatedOn: moment().format('YYYY-MM-DD')
    };

    input['AuditHistory'] = [];
    input['AuditHistory'].push(input.Audit);

    const objective = new Objective(input);

    objective.save().then((data) => {
      res.status(200).json(data);
    }).catch((err) => {
      next(err);
    });

    Objective.find({}).then(data => {
      setCache('allobjectives', data);
    });

  } catch (error) {
    next(error);
  }
});

// Endpoint to get all objectives
route.get('/getallobjectives', verifyToken, async (req, res, next) => {
  try {
    if (req.Role === 'Developer') {
      res.status(400).send({ Message: 'You are not authorized to fetch all the objectives.' });
      return;
    }

    const data = await getCache('allobjectives');

    if (data) {
      res.status(200).send({ Objectives: JSON.parse(data), fromCache: true });
    } else {
      Objective.find({}).then(data => {
        setCache('allobjectives', data);
        res.status(200).send({ Objectives: data, fromCache: false });
      }).catch(err => next(err));
    }
  } catch (error) {
    next(error);
  }
});

// Endpoint to get objectives of a specific user
route.get('/getspecificuserobjective/:emailid', verifyToken, async (req, res, next) => {
  try {
    const email = req.params.emailid;
    const requestingUser = await ObjectiveUser.findOne({ Email: req.Email });

    if (!requestingUser) {
      res.status(401).send({ Message: 'No User with this Email exists' });
      return;
    } else if (requestingUser.Email !== req.Email && req.Role === 'Developer') {
      res.status(400).send({ Message: 'Developers are not authorized to fetch objectives of anyone else other than themselves' });
      return;
    }

    Objective.find({ AssignedTo: email }).then(data => {
      if (!data || data.length === 0)
        res.status(401).send({ Message: 'No objectives found for the given User' });
      else
        res.status(200).send(data);
    }).catch(err => next(err));

  } catch (error) {
    next(error);
  }
});

// Endpoint to edit an objective
route.put('/editobjective/:name', verifyToken, (req, res, next) => {
  try {
    const objectiveName = req.params.name;
    Objective.findOne({ Name: objectiveName }).then(data => {
      if (!data) {
        res.status(401).send({ Message: 'No objective found with the given name.' });
        return;
      } else {
        if (req.Role === 'Developer') {
          if (req.Email !== data.AssignedTo) {
            res.status(403).send({ Message: 'You are not authorized to update objective of any other user except for yourself.' });
            return;
          } else if (["Name", "TargetValue", "ValueType", "Creator", "DueDate", "Audit", "AuditHistory", "AssignedTo"].some(prop => req.body.hasOwnProperty(prop))) {
            res.status(403).send({ Message: "You are not authorized to make changes to these items: Name, TargetValue, ValueType, Creator, DueDate, Audit, AuditHistory, AssignedTo" });
            return;
          }
        }

        const newData = { ...data._doc, ...req.body };
        newData.Audit["UpdatedOn"] = moment().format('YYYY-MM-DD');
        newData.Audit.UpdatedBy = req.Email;
        newData.Audit.ChangeValue = req.body.CurrentValue || data.CurrentValue;
        newData.AuditHistory.push(newData.Audit);

        Objective.updateOne({ Name: objectiveName }, {
          $set: {
            ...req.body,
            Audit: newData.Audit
          },
          $push: { AuditHistory: newData.Audit }
        }).then(data => {
          res.status(200).send({ ...data, Message: 'Updated Successfully' });
          Objective.find({}).then(data => {
            setCache('allobjectives', data);
          }).catch(err => next(err));
        }).catch(err => next(err));
      }
    });
  } catch (error) {
    next(error);
  }
});

// Endpoint to delete an objective
route.delete('/deleteobjective/:name', verifyToken, (req, res, next) => {
    try {
      const objectiveName = req.params.name;
      Objective.findOne({ Name: objectiveName }).then(data => {
        if (!data) {
          res.status(401).send({ Message: 'No objective found with the given name.' });
          return;
        } else {
          if (req.Role === 'Developer' && req.Email !== data.AssignedTo) {
            res.status(403).send({ Message: 'You are not authorized to delete objective of any other user except for yourself.' });
            return;
            
          }
  
          
  
          Objective.deleteOne({ Name: objectiveName }, {
            
          }).then(data => {
            res.status(200).send({ ...data, Message: 'Deleted Successfully' });
            Objective.find({}).then(data => {
              setCache('allobjectives', data);
            }).catch(err => next(err));
          }).catch(err => next(err));
        }
      });
    } catch (error) {
      next(error);
    }
  });

export default route; // Exporting the router
