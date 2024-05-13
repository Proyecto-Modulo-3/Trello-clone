import React, { useEffect, useState, useContext } from "react";
import { getLists, deleteList, editList } from "../../services/api.service";
import { useNavigate } from "react-router-dom";
import { useReloadContext } from "../../contexts/reload.context";
import AuthContext from "../../contexts/auth.context";

function AllLists({ title, category }) {
  const [lists, setLists] = useState([]);
  const [editingListId, setEditingListId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const navigate = useNavigate();
  const { now, reload } = useReloadContext();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function fetchLists() {
      const query = {};
      if (title) query.title = title;
      if (category) query.category = category;
      try {
        const { data: fetchedLists } = await getLists(query);
        const listsOwnedBy = fetchedLists.map((list) => ({
          ...list,
          owner: list.owner.id,
        }));
        setLists(listsOwnedBy);
      } catch (error) {
        console.error(error);
      }
    }
    fetchLists();
  }, [title, category, now, user, reload]);

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
      reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditList = async (listId) => {
    try {
      await editList(listId, { title: editedTitle });
      setEditingListId(null);
      setEditedTitle("");
      reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event) => {
    setEditedTitle(event.target.value);
  };

  return (
    <div>
      {lists.map((list) => (
        <div key={list.id}>
        
          {editingListId === list.id ? (
            <div>
              <input
                type="text"
                value={editedTitle}
                onChange={handleInputChange}
              />
              <button onClick={() => handleEditList(list.id)}>Save</button>
            </div>
          ) : (
            <div className="d-flex mx-2 mt-2 align-items-center">
              <div style={{ backgroundColor: list.color, padding: '10px', marginRight: '5px', borderRadius: '5px', width: '35px', height: '35px' }}></div>
              <button
                onClick={() => {
                  navigate(`/lists/${list.id}`);
                }}
              >
                {list.title}
              </button>
              <button
                onClick={() => handleDeleteList(list.id)}
                className="btn btn-danger"
              >
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
              <button
                onClick={() => {
                  setEditingListId(list.id);
                  setEditedTitle(list.title);
                }}
                className="btn btn-primary"
              >
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </button>
            </div>
          )}
          </div>
      ))}
    </div>
  );
}

export default AllLists;
