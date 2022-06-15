import markdown2
import random
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.core.files.storage import default_storage
from django import forms
from . import util


# Form for searching for an entry
class search_form(forms.Form):
    query = forms.CharField(label="", widget=forms.TextInput(attrs={'placeholder': 'Search Encyclopedia', 'style': 'width:100%', 'autocomplete': 'off'}))

# Form for creating a new page
class new_page_form(forms.Form):
    title = forms.CharField(label="Add Title")
    markdown_content = forms.CharField(widget=forms.Textarea(attrs={"rows":2, "cols":20}), label="Add Markdown Content")

# Form for editing an existing page
class edit_page_form(forms.Form):
    title = forms.CharField(widget=forms.TextInput(attrs={'id': 'edit_title'}))
    markdown_content = forms.CharField(widget=forms.Textarea(attrs={'id': 'edit_content'}))

# Render home page
def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries(), 
        "search_form": search_form
    })

# Render page for the given entry
def pages(request, entry):
    title = entry
    content = util.get_entry(title)
    
    if request.method == "GET":
        # If the entry does not exist, render the error page with the appropriate message
        if content == None:
            return render(request, "encyclopedia/error.html", {
                "message": "The page you're looking for does not exist.",
                "search_form": search_form
            })
        # If the entry does exist, bring user to that page
        else:
            return render(request, "encyclopedia/entry.html", {
                "content": markdown2.markdown(content),
                "entry": entry,
                "search_form": search_form, 
                "entry": entry
            })
    elif request.method == "POST":
        pass

# Search for an entry
def search(request):
    if request.method == "POST":
        form = search_form(request.POST)
        # Make sure form is valid
        if form.is_valid():
            # Process the data into the search term
            q = form.cleaned_data['query']
        # If the search term does not match an existing entry, pull up search results
        if util.get_entry(q) == None:
            # Create empty new list of matches
            matches = []
            # Loop over every entry that exists
            for entry in util.list_entries():
                # If the search term is a substring in the entry, add that entry to the "matches" list
                if q.lower() in entry.lower():
                    matches.append(entry)
            # If at least one search result, render search template with all search results
            if len(matches) > 0:
                return render(request, "encyclopedia/search.html", {
                    "entries": matches, 
                    "search_form": search_form,
                    "message": "",
                    "q": q,
                })
            # If no search results matched, render search template with message
            else:
                return render(request, "encyclopedia/search.html", {
                    "entries": matches,
                    "search_form": search_form,
                    "message": "Sorry, your search resulted in no matches."
                })
        # If the search term does match an entry, redirect to that page
        else:
            return HttpResponseRedirect(f"/wiki/{q}")


# Create a new entry
def create(request):
    # If the request method is get, render the "create" page with an empty form
    if request.method == "GET":
        return render(request, "encyclopedia/create.html", {
            "form": new_page_form(), 
            "search_form": search_form
        })
    # If the request is POST... 
    elif request.method == "POST":
        entries = util.list_entries()
        form = new_page_form(request.POST) # A form bound to the POST data
        # Make sure form is valid
        if form.is_valid():
            # Process the data into a title and markdown content
            title = form.cleaned_data['title']
            markdown_content = f"{form.cleaned_data['markdown_content']}"

        # If page the user is trying to create already exists, present an error message
        for entry in entries:
            if title.lower() == entry.lower():
                return render(request, "encyclopedia/error.html", {
                    "message": "Page already exists.", 
                    "search_form": search_form
                })
        
        # If page does not already exist, create it and redirect user to it
        util.save_entry(title, markdown_content)
        return HttpResponseRedirect(f"/wiki/{title}")
       
# Get a random entry page that already exists
def get_random(request):
    # Get a random entry title from the current list of entries
    title = random.choice(util.list_entries())
    # Redirect user to that page
    return HttpResponseRedirect(f"/wiki/{title}")

# Edit a current entry page
def edit(request, entry):
    if request.method == "POST":
        if 'edit' in request.POST:
            markdown_content = util.get_entry(entry)
            form = edit_page_form(initial = {
                'title': entry, 'markdown_content': markdown_content
                })

            return render(request, "encyclopedia/edit.html", {
                "entry": entry,
                "search_form": search_form,
                "edit_form": form
            })
        elif 'delete' in request.POST:
            util.delete_entry(entry)
            return HttpResponseRedirect("/")

# Save the edited entry page
def saved(request, entry):
    if request.method == "POST":
        form = edit_page_form(request.POST)
        if form.is_valid():
            title = form.cleaned_data['title']
            markdown_content = form.cleaned_data['markdown_content']
            # If the title was changed, delete old file
            if title != entry:
                filename = f"entries/{entry}.md"
                if default_storage.exists(filename):
                    default_storage.delete(filename)

            # Save the new or updated file
            util.save_entry(title, markdown_content)

            # Get the new entry
            new_entry = util.get_entry(title)

            # Redirect user to new file
            return render(request, "encyclopedia/entry.html", {
                "content": markdown2.markdown(new_entry),
                "search_form": search_form, 
                "entry": title
            })

    
def handler500(request):
    return render(request, 'encyclopedia/500.html')

def handler404(request, exception):
    return render(request, 'encyclopedia/404.html')